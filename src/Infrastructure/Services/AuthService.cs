using Application.Common.Services;
using Application.Common.Utilities;
using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IApplicationDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IPasswordService _passwordService;

        public AuthService(IApplicationDbContext context, ITokenService tokenService, IPasswordService passwordService)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordService = passwordService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterUserDto request, CancellationToken cancellationToken)
        {
            var mobileNumber = MobileNumberHelper.Normalize(request.MobileNumber);

            // Validate mobile number uniqueness
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.MobileNumber == mobileNumber, cancellationToken);

            if (existingUser != null)
                throw new InvalidOperationException("Mobile number already registered");

            // Validate email uniqueness if provided
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var emailExists = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

                if (emailExists != null)
                    throw new InvalidOperationException("Email already registered");
            }

            // Hash password using BCrypt
            var passwordHash = _passwordService.Hash(request.Password);

            // Create user
            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                MobileNumber = mobileNumber,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = request.Role,
                CanCreatePartners = request.Role == "Employee" && request.CanCreatePartners,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);

            // Generate JWT token
            var token = _tokenService.GenerateForUser(user);

            return new AuthResponseDto
            {
                Token = token,
                UserId = user.Id.ToString(),
                Role = user.Role,
                Name = user.Name,
                MobileNumber = user.MobileNumber,
                CanCreatePartners = user.CanCreatePartners
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto request, CancellationToken cancellationToken)
        {
            var mobileNumber = MobileNumberHelper.Normalize(request.MobileNumber);

            // Find user by mobile number
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.MobileNumber == mobileNumber, cancellationToken);

            if (user == null)
                throw new UnauthorizedAccessException("Invalid mobile number or password");

            // Check if user is active
            if (!user.IsActive)
                throw new UnauthorizedAccessException("User account is inactive");

            Guid? partnerId = null;
            if (user.Role == "Partner")
            {
                var partner = await _context.Partners
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);

                if (partner == null || !partner.IsActive)
                    throw new UnauthorizedAccessException("Partner account is inactive");

                partnerId = partner.Id;
            }

            // Verify password using BCrypt
            if (!_passwordService.Verify(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid mobile number or password");

            // Generate JWT token
            var token = _tokenService.GenerateForUser(user, partnerId);

            return new AuthResponseDto
            {
                Token = token,
                UserId = user.Id.ToString(),
                PartnerId = partnerId,
                Role = user.Role,
                Name = user.Name,
                MobileNumber = user.MobileNumber,
                CanCreatePartners = user.CanCreatePartners
            };
        }

        public async Task<AuthResponseDto> LoginByEmailAsync(LoginByEmailDto request, CancellationToken cancellationToken)
        {
            // Find user by email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or password");

            // Check if user is active
            if (!user.IsActive)
                throw new UnauthorizedAccessException("User account is inactive");

            Guid? partnerId = null;
            if (user.Role == "Partner")
            {
                var partner = await _context.Partners
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);

                if (partner == null || !partner.IsActive)
                    throw new UnauthorizedAccessException("Partner account is inactive");

                partnerId = partner.Id;
            }

            // Verify password using BCrypt
            if (!_passwordService.Verify(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password");

            // Generate JWT token
            var token = _tokenService.GenerateForUser(user, partnerId);

            return new AuthResponseDto
            {
                Token = token,
                UserId = user.Id.ToString(),
                PartnerId = partnerId,
                Role = user.Role,
                Name = user.Name,
                MobileNumber = user.MobileNumber,
                CanCreatePartners = user.CanCreatePartners
            };
        }

        public async Task<UserDto?> GetUserByMobileNumberAsync(string mobileNumber, CancellationToken cancellationToken)
        {
            var normalizedMobileNumber = MobileNumberHelper.Normalize(mobileNumber);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.MobileNumber == normalizedMobileNumber, cancellationToken);

            return user == null ? null : MapToUserDto(user);
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            return user == null ? null : MapToUserDto(user);
        }

        public async Task<List<UserDto>> GetUsersByRoleAsync(string role, CancellationToken cancellationToken)
        {
            return await _context.Users
                .AsNoTracking()
                .Where(user => user.Role == role)
                .OrderBy(user => user.Name)
                .Select(user => new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email ?? string.Empty,
                    MobileNumber = user.MobileNumber,
                    Role = user.Role,
                    CanCreatePartners = user.CanCreatePartners,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt,
                })
                .ToListAsync(cancellationToken);
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email ?? string.Empty,
                MobileNumber = user.MobileNumber,
                Role = user.Role,
                CanCreatePartners = user.CanCreatePartners,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
