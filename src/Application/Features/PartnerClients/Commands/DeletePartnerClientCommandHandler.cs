using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.PartnerClients.Commands
{
    public class DeletePartnerClientCommandHandler : IRequestHandler<DeletePartnerClientCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeletePartnerClientCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeletePartnerClientCommand request, CancellationToken cancellationToken)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == request.ClientId && c.PartnerId == request.PartnerId, cancellationToken);

            if (client == null)
                return false;

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}