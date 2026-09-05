using Application.Common.Interfaces;
using Application.Common.Services;
using Application.DTOs;
using Application.Features.Admins.Commands;
using Application.Features.Admins.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<AdminController> _logger;
        private readonly IApplicationDbContext _context;
        private readonly IPasswordService _passwordService;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public AdminController(
            IMediator mediator,
            ILogger<AdminController> logger,
            IApplicationDbContext context,
            IPasswordService passwordService,
            IConfiguration configuration,
            IWebHostEnvironment environment)
        {
            _mediator = mediator;
            _logger = logger;
            _context = context;
            _passwordService = passwordService;
            _configuration = configuration;
            _environment = environment;
        }

        /// <summary>
        /// Admin login endpoint
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AdminLoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AdminLoginResponse>> Login([FromBody] AdminLoginRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                    return BadRequest(new { message = "Email and password are required" });

                var command = new AdminLoginCommand
                {
                    Email = request.Email,
                    Password = request.Password
                };

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Admin login failed");
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] PasswordResetRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { message = "Email is required." });

            var emailConfigured = IsPasswordResetEmailConfigured();
            if (!emailConfigured && !_environment.IsDevelopment())
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Password reset email is not configured." });

            var email = request.Email.Trim();
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            var tokenHash = HashToken(token);
            var expiresAt = DateTime.UtcNow.AddMinutes(30);
            string? developmentResetUrl = null;

            var admin = await _context.Admins.FirstOrDefaultAsync(
                account => account.Email.ToLower() == email.ToLower() && account.IsActive,
                cancellationToken);
            var user = admin == null
                ? await _context.Users.FirstOrDefaultAsync(
                    account => account.Email != null && account.Email.ToLower() == email.ToLower() &&
                        (account.Role == "Admin" || account.Role == "SuperAdmin") && account.IsActive,
                    cancellationToken)
                : null;

            if (admin != null)
            {
                admin.PasswordResetTokenHash = tokenHash;
                admin.PasswordResetTokenExpiresAt = expiresAt;
                await _context.SaveChangesAsync(cancellationToken);
                developmentResetUrl = await DeliverPasswordReset(admin.Email, token, emailConfigured);
            }
            else if (user != null)
            {
                user.PasswordResetTokenHash = tokenHash;
                user.PasswordResetTokenExpiresAt = expiresAt;
                await _context.SaveChangesAsync(cancellationToken);
                developmentResetUrl = await DeliverPasswordReset(user.Email!, token, emailConfigured);
            }

            var message = developmentResetUrl == null
                ? "If an active admin account matches that email, a password reset link has been sent."
                : $"Development reset link: {developmentResetUrl}";
            return Ok(new { message });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] PasswordResetConfirmationRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token) || request.NewPassword.Length < 8)
                return BadRequest(new { message = "Email, reset token, and a password of at least 8 characters are required." });

            var email = request.Email.Trim();
            var tokenHash = HashToken(request.Token);
            var now = DateTime.UtcNow;
            var admin = await _context.Admins.FirstOrDefaultAsync(
                account => account.Email.ToLower() == email.ToLower() && account.IsActive,
                cancellationToken);
            var user = admin == null
                ? await _context.Users.FirstOrDefaultAsync(
                    account => account.Email != null && account.Email.ToLower() == email.ToLower() &&
                        (account.Role == "Admin" || account.Role == "SuperAdmin") && account.IsActive,
                    cancellationToken)
                : null;

            var isValidAdminToken = admin?.PasswordResetTokenHash != null &&
                admin.PasswordResetTokenExpiresAt > now &&
                CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(admin.PasswordResetTokenHash), Encoding.UTF8.GetBytes(tokenHash));
            var isValidUserToken = user?.PasswordResetTokenHash != null &&
                user.PasswordResetTokenExpiresAt > now &&
                CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(user.PasswordResetTokenHash), Encoding.UTF8.GetBytes(tokenHash));

            if (!isValidAdminToken && !isValidUserToken)
                return BadRequest(new { message = "This password reset link is invalid or has expired." });

            if (admin != null)
            {
                admin.Password = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(request.NewPassword)));
                admin.PasswordResetTokenHash = null;
                admin.PasswordResetTokenExpiresAt = null;
            }
            else if (user != null)
            {
                user.PasswordHash = _passwordService.Hash(request.NewPassword);
                user.PasswordResetTokenHash = null;
                user.PasswordResetTokenExpiresAt = null;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return Ok(new { message = "Your password has been reset. You can now sign in." });
        }

        private async Task SendPasswordResetEmail(string email, string token)
        {
            var resetUrl = BuildPasswordResetUrl(email, token);
            using var message = new MailMessage(
                _configuration["PasswordReset:FromEmail"]!,
                email,
                "Reset your ArthSMS admin password",
                $"Use this link to reset your admin password. It expires in 30 minutes: {resetUrl}");
            using var client = new SmtpClient(_configuration["PasswordReset:SmtpHost"], int.Parse(_configuration["PasswordReset:SmtpPort"] ?? "587"))
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(
                    _configuration["PasswordReset:SmtpUsername"],
                    _configuration["PasswordReset:SmtpPassword"])
            };
            await client.SendMailAsync(message);
        }

        private async Task<string?> DeliverPasswordReset(string email, string token, bool emailConfigured)
        {
            if (emailConfigured)
            {
                await SendPasswordResetEmail(email, token);
                return null;
            }

            var resetUrl = BuildPasswordResetUrl(email, token);
            _logger.LogWarning("SMTP is not configured. Development password reset link: {ResetUrl}", resetUrl);
            return resetUrl;
        }

        private string BuildPasswordResetUrl(string email, string token) =>
            $"{_configuration["PasswordReset:FrontendUrl"]?.TrimEnd('/')}/admin/reset-password?email={Uri.EscapeDataString(email)}&token={token}";

        private bool IsPasswordResetEmailConfigured() =>
            !string.IsNullOrWhiteSpace(_configuration["PasswordReset:SmtpHost"]) &&
            !string.IsNullOrWhiteSpace(_configuration["PasswordReset:FromEmail"]);

        private static string HashToken(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

        /// <summary>
        /// Get all clients with filters
        /// </summary>
        [HttpGet("clients")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(List<AdminClientDetailDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<AdminClientDetailDto>>> GetAllClients(
            [FromQuery] string? search,
            [FromQuery] string? businessType)
        {
            try
            {
                var query = new GetAllClientsQuery
                {
                    SearchTerm = search,
                    FilterByBusinessType = businessType
                };

                var clients = await _mediator.Send(query);
                return Ok(clients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching clients");
                return StatusCode(500, new { message = "Error fetching clients" });
            }
        }

        [HttpGet("clients/{clientId:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(AdminClientDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AdminClientDetailDto>> GetClientById(Guid clientId, CancellationToken cancellationToken)
        {
            var client = await _mediator.Send(new GetAdminClientByIdQuery
            {
                ClientId = clientId
            }, cancellationToken);

            if (client == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            return Ok(client);
        }

        [HttpPost("clients")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(AdminClientDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AdminClientDetailDto>> CreateClient([FromBody] CreateAdminClientCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var client = await _mediator.Send(command, cancellationToken);
                return CreatedAtAction(nameof(GetClientById), new { clientId = client.Id }, client);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Admin client creation failed");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating client");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error creating client" });
            }
        }

        [HttpPut("clients/{clientId:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(AdminClientDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AdminClientDetailDto>> UpdateClient(Guid clientId, [FromBody] UpdateAdminClientCommand command, CancellationToken cancellationToken)
        {
            try
            {
                command.ClientId = clientId;
                var client = await _mediator.Send(command, cancellationToken);
                return Ok(client);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Admin client update failed for {ClientId}", clientId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating client {ClientId}", clientId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error updating client" });
            }
        }

        /// <summary>
        /// Get consolidated stats and widgets for the admin dashboard
        /// </summary>
        [HttpGet("dashboard-stats")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(AdminDashboardStatsDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<AdminDashboardStatsDto>> GetDashboardStats(CancellationToken cancellationToken)
        {
            try
            {
                var stats = await _mediator.Send(new GetAdminDashboardStatsQuery(), cancellationToken);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching admin dashboard stats");
                return StatusCode(500, new { message = "Error fetching admin dashboard stats" });
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { message = "Admin API is healthy" });
        }
    }
}
