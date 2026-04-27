using AutoMapper;
using Application.Common.Interfaces;
using Application.Common.Utilities;
using Domain.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.GroupMembers.Commands
{
    public class CreateGroupMemberCommandHandler : IRequestHandler<CreateGroupMemberCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CreateGroupMemberCommandHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(CreateGroupMemberCommand request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<GroupMember>(request);
            entity.Id = Guid.NewGuid();
            entity.PhoneNumber = MobileNumberHelper.Normalize(request.PhoneNumber);

            _context.GroupMembers.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);

            return entity.Id;
        }
    }
}
