using Application.Common.Interfaces;
using Application.DTOs;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.GroupMembers.Commands
{
    public class UpdateGroupMemberKnownContactCommandHandler : IRequestHandler<UpdateGroupMemberKnownContactCommand, GroupMemberDto?>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public UpdateGroupMemberKnownContactCommandHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<GroupMemberDto?> Handle(UpdateGroupMemberKnownContactCommand request, CancellationToken cancellationToken)
        {
            var member = await _context.GroupMembers
                .FirstOrDefaultAsync(groupMember => groupMember.Id == request.Id, cancellationToken);

            if (member == null)
            {
                return null;
            }

            member.IsKnownContact = request.IsKnownContact;
            await _context.SaveChangesAsync(cancellationToken);

            return _mapper.Map<GroupMemberDto>(member);
        }
    }
}