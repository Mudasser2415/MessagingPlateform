using Application.Common.Interfaces;
using Application.Common.Services;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admins.Commands
{
    public class AdminLoginCommandHandler : IRequestHandler<AdminLoginCommand, AdminLoginResponse>
    {
        private readonly IApplicationDbContext _context;
        private readonly IPasswordService _passwordService;
        private readonly ITokenService _tokenService;

        public AdminLoginCommandHandler(
            IApplicationDbContext context,
            ITokenService tokenService,
            IPasswordService passwordService)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordService = passwordService;
        }

        public async Task<AdminLoginResponse> Handle(AdminLoginCommand request, CancellationToken cancellationToken)
        {
            var email = request.Email.Trim();

            // First support legacy records in the dedicated Admins table.
            var admin = await _context.Admins
                .FirstOrDefaultAsync(a => a.Email.ToLower() == email.ToLower(), cancellationToken);

            if (admin != null)
            {
                if (!VerifyLegacyAdminPassword(request.Password, admin.Password))
                    throw new UnauthorizedAccessException("Invalid email or password");

                if (!admin.IsActive)
                    throw new UnauthorizedAccessException("Admin account is inactive");

                admin.LastLoginAt = DateTime.UtcNow;
                _context.Admins.Update(admin);
                await _context.SaveChangesAsync(cancellationToken);

                var adminToken = _tokenService.GenerateForAdmin(admin);

                return new AdminLoginResponse
                {
                    AdminId = admin.Id,
                    Email = admin.Email,
                    FullName = admin.FullName,
                    Role = admin.Role,
                    Token = adminToken
                };
            }

            // Also support user accounts that were registered with Role = Admin.
            var user = await _context.Users
                .FirstOrDefaultAsync(
                    u => u.Email != null && u.Email.ToLower() == email.ToLower() && u.Role == "Admin",
                    cancellationToken);

            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or password");

            if (!_passwordService.Verify(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("Admin account is inactive");

            var userToken = _tokenService.GenerateForUser(user);

            return new AdminLoginResponse
            {
                AdminId = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.Name,
                Role = user.Role,
                Token = userToken
            };
        }

        private bool VerifyLegacyAdminPassword(string password, string hash)
        {
            return hash == Convert.ToBase64String(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(password)));
        }
    }
}
