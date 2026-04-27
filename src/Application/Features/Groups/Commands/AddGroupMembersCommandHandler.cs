using Application.Common.Interfaces;
using Application.Common.Services;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Groups.Commands
{
    public class AddGroupMembersCommandHandler : IRequestHandler<AddGroupMembersCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IPhoneValidationService _phoneValidationService;

        public AddGroupMembersCommandHandler(
            IApplicationDbContext context,
            IPhoneValidationService phoneValidationService)
        {
            _context = context;
            _phoneValidationService = phoneValidationService;
        }

        public async Task<bool> Handle(AddGroupMembersCommand request, CancellationToken cancellationToken)
        {
            var groupExists = await _context.Groups
                .AnyAsync(group => group.GroupId == request.GroupId, cancellationToken);

            if (!groupExists)
            {
                return false;
            }

            var (validPhones, _) = _phoneValidationService.ValidateAndNormalizeBatch(request.PhoneNumbers);
            if (validPhones.Count == 0)
            {
                return true;
            }

            var existingPhones = await _context.GroupMembers
                .AsNoTracking()
                .Where(groupMember => groupMember.GroupId == request.GroupId)
                .Select(groupMember => groupMember.PhoneNumber)
                .ToListAsync(cancellationToken);

            var existingPhoneSet = existingPhones.ToHashSet(StringComparer.OrdinalIgnoreCase);

            var newMembers = validPhones
                .Where(phone => !existingPhoneSet.Contains(phone))
                .Select(phone => new GroupMember
                {
                    Id = Guid.NewGuid(),
                    GroupId = request.GroupId,
                    PhoneNumber = phone,
                })
                .ToList();

            if (newMembers.Count == 0)
            {
                return true;
            }

            _context.GroupMembers.AddRange(newMembers);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}