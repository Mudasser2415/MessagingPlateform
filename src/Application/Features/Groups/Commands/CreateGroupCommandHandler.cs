using AutoMapper;
using Application.Common.Interfaces;
using Application.Common.Services;
using Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Groups.Commands
{
    public class CreateGroupCommandHandler : IRequestHandler<CreateGroupCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IPhoneValidationService _phoneValidationService;

        public CreateGroupCommandHandler(
            IApplicationDbContext context, 
            IMapper mapper,
            IPhoneValidationService phoneValidationService)
        {
            _context = context;
            _mapper = mapper;
            _phoneValidationService = phoneValidationService;
        }

        public async Task<Guid> Handle(CreateGroupCommand request, CancellationToken cancellationToken)
        {
            // Create the group
            var group = _mapper.Map<Group>(request);
            group.GroupId = Guid.NewGuid();
            group.CreatedAt = DateTime.UtcNow;

            // Validate and normalize phone numbers (optional)
            var groupMembers = new List<GroupMember>();
            if (request.PhoneNumbers != null && request.PhoneNumbers.Count > 0)
            {
                var (validPhones, _) = _phoneValidationService.ValidateAndNormalizeBatch(request.PhoneNumbers);
                groupMembers = validPhones
                    .Select(phone => new GroupMember
                    {
                        Id = Guid.NewGuid(),
                        GroupId = group.GroupId,
                        PhoneNumber = phone
                    })
                    .ToList();
            }

            // Begin transaction for atomicity
            using (var transaction = await _context.Database.BeginTransactionAsync(cancellationToken))
            {
                try
                {
                    _context.Groups.Add(group);
                    await _context.SaveChangesAsync(cancellationToken);

                    // Bulk insert group members
                    _context.GroupMembers.AddRange(groupMembers);
                    await _context.SaveChangesAsync(cancellationToken);

                    await transaction.CommitAsync(cancellationToken);
                }
                catch
                {
                    await transaction.RollbackAsync(cancellationToken);
                    throw;
                }
            }

            return group.GroupId;
        }
    }
}
