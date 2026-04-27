using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Groups.Commands
{
    public class UpdateGroupCommandHandler : IRequestHandler<UpdateGroupCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateGroupCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateGroupCommand request, CancellationToken cancellationToken)
        {
            var group = await _context.Groups
                .FirstOrDefaultAsync(g => g.GroupId == request.GroupId, cancellationToken);

            if (group == null) return false;

            group.GroupName = request.GroupName;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
