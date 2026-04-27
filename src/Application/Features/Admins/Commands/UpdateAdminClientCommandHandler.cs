using Application.Common.Interfaces;
using Application.Common.Utilities;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admins.Commands
{
    public class UpdateAdminClientCommandHandler : IRequestHandler<UpdateAdminClientCommand, AdminClientDetailDto>
    {
        private readonly IApplicationDbContext _context;

        public UpdateAdminClientCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AdminClientDetailDto> Handle(UpdateAdminClientCommand request, CancellationToken cancellationToken)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(existingClient => existingClient.Id == request.ClientId, cancellationToken)
                ?? throw new KeyNotFoundException("Client not found.");

            if (request.PartnerId.HasValue)
            {
                var partnerExists = await _context.Partners
                    .AsNoTracking()
                    .AnyAsync(partner => partner.Id == request.PartnerId.Value, cancellationToken);

                if (!partnerExists)
                {
                    throw new KeyNotFoundException("Selected partner was not found.");
                }
            }

            client.PartnerId = request.PartnerId;
            client.Name = request.Name.Trim();
            client.MobileNumber = MobileNumberHelper.Normalize(request.MobileNumber);
            client.Address = request.Address.Trim();
            client.Location = request.Location.Trim();
            client.BusinessType = request.BusinessType.Trim();
            client.EmailId = request.EmailId?.Trim() ?? string.Empty;

            await _context.SaveChangesAsync(cancellationToken);

            return await AdminClientDetailBuilder.BuildAsync(_context, client.Id, cancellationToken)
                ?? throw new InvalidOperationException("Updated client could not be loaded.");
        }
    }
}