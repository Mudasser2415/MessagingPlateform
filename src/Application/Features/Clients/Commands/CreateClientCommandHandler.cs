using AutoMapper;
using Application.Common.Interfaces;
using Application.Common.Utilities;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Clients.Commands
{
    public class CreateClientCommandHandler : IRequestHandler<CreateClientCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentRequestContext _currentRequestContext;
        private readonly IMapper _mapper;

        public CreateClientCommandHandler(IApplicationDbContext context, ICurrentRequestContext currentRequestContext, IMapper mapper)
        {
            _context = context;
            _currentRequestContext = currentRequestContext;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(CreateClientCommand request, CancellationToken cancellationToken)
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

                createdByUserId = employee.Id;
            }

            if (request.PartnerId.HasValue)
            {
                var partnerQuery = _context.Partners
                    .AsNoTracking()
                    .Where(partner => partner.Id == request.PartnerId.Value && partner.IsActive);

                if (requesterRole == "Employee" && requesterId.HasValue)
                {
                    partnerQuery = partnerQuery.Where(partner => partner.CreatedByUserId == requesterId.Value);
                }

                var partnerExists = await partnerQuery.AnyAsync(cancellationToken);
                if (!partnerExists)
                    throw new UnauthorizedAccessException("The selected partner is not available for this user.");
            }

            var client = _mapper.Map<Client>(request);
            client.Id = Guid.NewGuid();
            client.MobileNumber = MobileNumberHelper.Normalize(request.MobileNumber);
            client.CreatedByUserId = createdByUserId;
            client.CreatedAt = DateTime.UtcNow;

            _context.Clients.Add(client);

            if (createdByUserId.HasValue)
            {
                _context.ClientEmployeeMappings.Add(new ClientEmployeeMapping
                {
                    Id = Guid.NewGuid(),
                    ClientId = client.Id,
                    UserId = createdByUserId.Value,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync(cancellationToken);

            return client.Id;
        }
    }
}
