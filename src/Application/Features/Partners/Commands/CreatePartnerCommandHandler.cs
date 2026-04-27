using Application.Common.Interfaces;
using Application.Common.Services;
using Application.Common.Utilities;
using Application.DTOs;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Partners.Commands
{
    public class CreatePartnerCommandHandler : IRequestHandler<CreatePartnerCommand, PartnerDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentRequestContext _currentRequestContext;
        private readonly IPasswordService _passwordService;

        public CreatePartnerCommandHandler(IApplicationDbContext context, ICurrentRequestContext currentRequestContext, IPasswordService passwordService)
        {
            _context = context;
            _currentRequestContext = currentRequestContext;
            _passwordService = passwordService;
        }

        public async Task<PartnerDto> Handle(CreatePartnerCommand request, CancellationToken cancellationToken)
        {
            var requesterRole = _currentRequestContext.Role;
            var requesterId = _currentRequestContext.UserId;
            Guid? createdByUserId = null;

            if (requesterRole == "Employee")
            {
                if (!requesterId.HasValue)
                    throw new UnauthorizedAccessException("Authenticated employee context is required.");

                var employee = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        user => user.Id == requesterId.Value && user.Role == "Employee" && user.IsActive,
                        cancellationToken);

                if (employee == null)
                    throw new UnauthorizedAccessException("Employee account is not available.");

                if (!employee.CanCreatePartners)
                    throw new UnauthorizedAccessException("This employee is not allowed to create partners.");

                createdByUserId = employee.Id;
            }

            var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
            var mobileNumber = MobileNumberHelper.Normalize(request.MobileNumber);
            var companyAddress = string.IsNullOrWhiteSpace(request.Location)
                ? request.CompanyAddress.Trim()
                : request.Location.Trim();

            if (!string.IsNullOrWhiteSpace(email))
            {
                var emailExists = await _context.Users
                    .AnyAsync(u => u.Email == email, cancellationToken);
                if (emailExists)
                    throw new InvalidOperationException("Email already registered.");
            }

            var mobileExists = await _context.Users
                .AnyAsync(u => u.MobileNumber == mobileNumber, cancellationToken);
            if (mobileExists)
                throw new InvalidOperationException("Mobile number already registered.");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Email = email,
                MobileNumber = mobileNumber,
                PasswordHash = _passwordService.Hash(request.Password),
                Role = "Partner",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var partner = new Partner
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CreatedByUserId = createdByUserId,
                CompanyName = request.CompanyName.Trim(),
                CompanyAddress = companyAddress,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                User = user
            };

            _context.Users.Add(user);
            _context.Partners.Add(partner);
            await _context.SaveChangesAsync(cancellationToken);

            return new PartnerDto
            {
                PartnerId = partner.Id,
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email ?? string.Empty,
                MobileNumber = user.MobileNumber,
                CompanyName = partner.CompanyName,
                CompanyAddress = partner.CompanyAddress,
                IsActive = partner.IsActive,
                CreatedAt = partner.CreatedAt,
                LastLoginAt = partner.LastLoginAt,
                ClientCount = 0
            };
        }
    }
}