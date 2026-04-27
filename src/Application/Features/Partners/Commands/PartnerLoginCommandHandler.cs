using Application.Common.Interfaces;
using Application.Common.Services;
using Application.Common.Utilities;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Partners.Commands
{
    public class PartnerLoginCommandHandler : IRequestHandler<PartnerLoginCommand, PartnerAuthResponseDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IPasswordService _passwordService;

        public PartnerLoginCommandHandler(IApplicationDbContext context, ITokenService tokenService, IPasswordService passwordService)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordService = passwordService;
        }

        public async Task<PartnerAuthResponseDto> Handle(PartnerLoginCommand request, CancellationToken cancellationToken)
        {
            var identifier = request.EmailOrMobileNumber.Trim();
            var normalizedIdentifier = MobileNumberHelper.IsValid(identifier)
                ? MobileNumberHelper.Normalize(identifier)
                : identifier;

            var partner = await _context.Partners
                .Include(p => p.User)
                .FirstOrDefaultAsync(p =>
                    p.User.Role == "Partner" &&
                    (p.User.Email == identifier || p.User.MobileNumber == normalizedIdentifier),
                    cancellationToken)
                ?? throw new UnauthorizedAccessException("Invalid partner credentials.");

            if (!partner.IsActive || !partner.User.IsActive)
                throw new UnauthorizedAccessException("Partner account is inactive.");

            if (!_passwordService.Verify(request.Password, partner.User.PasswordHash))
                throw new UnauthorizedAccessException("Invalid partner credentials.");

            partner.LastLoginAt = DateTime.UtcNow;
            partner.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            return new PartnerAuthResponseDto
            {
                Token = _tokenService.GenerateForUser(partner.User, partner.Id),
                UserId = partner.UserId,
                PartnerId = partner.Id,
                Role = partner.User.Role,
                Name = partner.User.Name,
                Email = partner.User.Email ?? string.Empty,
                MobileNumber = partner.User.MobileNumber,
                CompanyName = partner.CompanyName
            };
        }
    }
}