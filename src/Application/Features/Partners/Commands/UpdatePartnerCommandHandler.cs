using Application.Common.Interfaces;
using Application.Common.Utilities;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Partners.Commands
{
    public class UpdatePartnerCommandHandler : IRequestHandler<UpdatePartnerCommand, PartnerDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentRequestContext _currentRequestContext;

        public UpdatePartnerCommandHandler(IApplicationDbContext context, ICurrentRequestContext currentRequestContext)
        {
            _context = context;
            _currentRequestContext = currentRequestContext;
        }

        public async Task<PartnerDto> Handle(UpdatePartnerCommand request, CancellationToken cancellationToken)
        {
            var query = _context.Partners
                .Include(p => p.User)
                .Where(p => p.Id == request.PartnerId);

            if (_currentRequestContext.Role == "Employee")
            {
                if (!_currentRequestContext.UserId.HasValue)
                    throw new UnauthorizedAccessException("Authenticated employee context is required.");

                var userId = _currentRequestContext.UserId.Value;
                query = query.Where(partner => partner.CreatedByUserId == userId);
            }

            var partner = await query.FirstOrDefaultAsync(cancellationToken)
                ?? throw new KeyNotFoundException("Partner not found.");

            var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
            var mobileNumber = MobileNumberHelper.Normalize(request.MobileNumber);

            if (!string.IsNullOrWhiteSpace(email))
            {
                var emailExists = await _context.Users
                    .AnyAsync(u => u.Id != partner.UserId && u.Email == email, cancellationToken);
                if (emailExists)
                    throw new InvalidOperationException("Email already registered.");
            }

            var mobileExists = await _context.Users
                .AnyAsync(u => u.Id != partner.UserId && u.MobileNumber == mobileNumber, cancellationToken);
            if (mobileExists)
                throw new InvalidOperationException("Mobile number already registered.");

            partner.User.Name = request.Name.Trim();
            partner.User.Email = email;
            partner.User.MobileNumber = mobileNumber;
            partner.User.IsActive = request.IsActive;
            partner.User.Role = "Partner";

            partner.CompanyName = request.CompanyName.Trim();
            partner.CompanyAddress = request.CompanyAddress.Trim();
            partner.IsActive = request.IsActive;
            partner.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            var clientCount = await _context.Clients.CountAsync(c => c.PartnerId == partner.Id, cancellationToken);

            return new PartnerDto
            {
                PartnerId = partner.Id,
                UserId = partner.UserId,
                Name = partner.User.Name,
                Email = partner.User.Email ?? string.Empty,
                MobileNumber = partner.User.MobileNumber,
                CompanyName = partner.CompanyName,
                CompanyAddress = partner.CompanyAddress,
                IsActive = partner.IsActive,
                CreatedAt = partner.CreatedAt,
                LastLoginAt = partner.LastLoginAt,
                ClientCount = clientCount
            };
        }
    }
}