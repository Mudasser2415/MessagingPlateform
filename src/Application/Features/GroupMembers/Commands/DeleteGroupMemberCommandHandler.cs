using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.GroupMembers.Commands
{
    public class DeleteGroupMemberCommandHandler : IRequestHandler<DeleteGroupMemberCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeleteGroupMemberCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteGroupMemberCommand request, CancellationToken cancellationToken)
        {
            var member = await _context.GroupMembers
                .FirstOrDefaultAsync(groupMember => groupMember.Id == request.Id, cancellationToken);

            if (member == null)
            {
                return false;
            }

            _context.GroupMembers.Remove(member);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}