using Application.Common.Interfaces;
using Application.Common.Utilities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.PartnerClients.Commands
{
    public class UpdatePartnerClientCommandHandler : IRequestHandler<UpdatePartnerClientCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdatePartnerClientCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdatePartnerClientCommand request, CancellationToken cancellationToken)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == request.ClientId && c.PartnerId == request.PartnerId, cancellationToken)
                ?? throw new KeyNotFoundException("Client not found for this partner.");

            client.Name = request.Name.Trim();
            client.MobileNumber = MobileNumberHelper.Normalize(request.MobileNumber);
            client.Address = request.Address.Trim();
            client.Location = request.Location.Trim();
            client.BusinessType = request.BusinessType.Trim();
            client.EmailId = request.EmailId.Trim();

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}