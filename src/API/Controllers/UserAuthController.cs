using Application.Common.Services;
using Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/user-auth")]
    public class UserAuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<UserAuthController> _logger;
        private readonly IValidator<RegisterUserDto> _registerValidator;
        private readonly IValidator<LoginDto> _loginValidator;
        private readonly IValidator<LoginByEmailDto> _loginByEmailValidator;

        public UserAuthController(
            IAuthService authService,
            ILogger<UserAuthController> logger,
            IValidator<RegisterUserDto> registerValidator,
            IValidator<LoginDto> loginValidator,
            IValidator<LoginByEmailDto> loginByEmailValidator)
        {
            _authService = authService;
            _logger = logger;
            _registerValidator = registerValidator;
            _loginValidator = loginValidator;
            _loginByEmailValidator = loginByEmailValidator;
        }

        /// <summary>
        /// Register a new user (Admin or Employee)
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterUserDto request, CancellationToken cancellationToken)
        {
            try
            {
                var validationResult = await _registerValidator.ValidateAsync(request, cancellationToken);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = validationResult.Errors
                            .GroupBy(error => error.PropertyName)
                            .ToDictionary(
                                group => group.Key,
                                group => group.Select(error => error.ErrorMessage).Distinct().ToArray())
                    });
                }

                var result = await _authService.RegisterAsync(request, cancellationToken);
                return CreatedAtAction(nameof(Register), result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Registration failed");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during registration");
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        /// <summary>
        /// Login user using mobile number and password
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto request, CancellationToken cancellationToken)
        {
            try
            {
                var validationResult = await _loginValidator.ValidateAsync(request, cancellationToken);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = validationResult.Errors
                            .GroupBy(error => error.PropertyName)
                            .ToDictionary(
                                group => group.Key,
                                group => group.Select(error => error.ErrorMessage).Distinct().ToArray())
                    });
                }

                var result = await _authService.LoginAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Login failed for mobile: {Mobile}", request.MobileNumber);
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during login");
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        /// <summary>
        /// Get current user profile (requires authentication)
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<UserDto>> GetProfile(CancellationToken cancellationToken)
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Invalid user id in token" });

                var user = await _authService.GetUserByIdAsync(userId, cancellationToken);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching profile");
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        /// <summary>
        /// Get user by mobile number (Admin only)
        /// </summary>
        [HttpGet("user/{mobileNumber}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDto>> GetUserByMobileNumber(string mobileNumber, CancellationToken cancellationToken)
        {
            try
            {
                var user = await _authService.GetUserByMobileNumberAsync(mobileNumber, cancellationToken);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching user");
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(List<UserDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<UserDto>>> GetUsers([FromQuery] string role = "Employee", CancellationToken cancellationToken = default)
        {
            try
            {
                var users = await _authService.GetUsersByRoleAsync(role, cancellationToken);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching users for role {Role}", role);
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        /// <summary>
        /// Login user using email and password (for Admin Portal)
        /// </summary>
        [HttpPost("login-email")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AuthResponseDto>> LoginByEmail([FromBody] LoginByEmailDto request, CancellationToken cancellationToken)
        {
            try
            {
                var validationResult = await _loginByEmailValidator.ValidateAsync(request, cancellationToken);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = validationResult.Errors
                            .GroupBy(error => error.PropertyName)
                            .ToDictionary(
                                group => group.Key,
                                group => group.Select(error => error.ErrorMessage).Distinct().ToArray())
                    });
                }

                var result = await _authService.LoginByEmailAsync(request, cancellationToken);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Login failed for email: {Email}", request.Email);
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during login by email");
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Health()
        {
            return Ok(new { message = "User Auth API is healthy", timestamp = DateTime.UtcNow });
        }
    }
}
