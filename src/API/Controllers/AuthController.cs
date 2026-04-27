using Application.Common.Services;
using Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly IValidator<LoginDto> _loginValidator;

        public AuthController(IAuthService authService, ILogger<AuthController> logger, IValidator<LoginDto> loginValidator)
        {
            _authService = authService;
            _logger = logger;
            _loginValidator = loginValidator;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request, CancellationToken cancellationToken)
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

                if (!string.Equals(result.Role, "Employee", StringComparison.OrdinalIgnoreCase))
                    return Unauthorized(new { message = "Only employee accounts can log in here." });

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Employee login failed");
                return Unauthorized(new { message = "Invalid mobile number or password." });
            }
        }
    }
}
