using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Groups.Commands
{
    public class DeleteGroupCommandHandler : IRequestHandler<DeleteGroupCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeleteGroupCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteGroupCommand request, CancellationToken cancellationToken)
        {
            var group = await _context.Groups
                .FirstOrDefaultAsync(g => g.GroupId == request.GroupId, cancellationToken);

            if (group == null) return false;

            _context.Groups.Remove(group);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
