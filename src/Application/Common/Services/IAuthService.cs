using Application.DTOs;

namespace Application.Common.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterUserDto request, CancellationToken cancellationToken);
        Task<AuthResponseDto> LoginAsync(LoginDto request, CancellationToken cancellationToken);
        Task<AuthResponseDto> LoginByEmailAsync(LoginByEmailDto request, CancellationToken cancellationToken);
        Task<UserDto?> GetUserByMobileNumberAsync(string mobileNumber, CancellationToken cancellationToken);
        Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken);
        Task<List<UserDto>> GetUsersByRoleAsync(string role, CancellationToken cancellationToken);
    }
}
