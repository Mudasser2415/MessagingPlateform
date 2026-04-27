using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ClientEmployeeMappings
{
    public class RemoveClientEmployeeMappingCommandHandler : IRequestHandler<RemoveClientEmployeeMappingCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public RemoveClientEmployeeMappingCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(RemoveClientEmployeeMappingCommand request, CancellationToken cancellationToken)
        {
            var mapping = await _context.ClientEmployeeMappings
                .FirstOrDefaultAsync(
                    item => item.ClientId == request.ClientId && item.UserId == request.UserId,
                    cancellationToken);

            if (mapping == null)
            {
                return false;
            }

            _context.ClientEmployeeMappings.Remove(mapping);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}