using Application.Common.Interfaces;
using Application.Common.Services;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Groups.Commands
{
    public class UpdateGroupMembersCommandHandler : IRequestHandler<UpdateGroupMembersCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IPhoneValidationService _phoneValidationService;

        public UpdateGroupMembersCommandHandler(
            IApplicationDbContext context,
            IPhoneValidationService phoneValidationService)
        {
            _context = context;
            _phoneValidationService = phoneValidationService;
        }

        public async Task<bool> Handle(UpdateGroupMembersCommand request, CancellationToken cancellationToken)
        {
            // Check if group exists
            var group = await _context.Groups
                .FirstOrDefaultAsync(g => g.GroupId == request.GroupId, cancellationToken);

            if (group == null)
                return false;

            // Validate and normalize phone numbers
            var (validPhones, _) = _phoneValidationService.ValidateAndNormalizeBatch(request.PhoneNumbers);

            // Begin transaction for atomicity
            using (var transaction = await _context.Database.BeginTransactionAsync(cancellationToken))
            {
                try
                {
                    // Remove all existing members for this group
                    var existingMembers = await _context.GroupMembers
                        .Where(gm => gm.GroupId == request.GroupId)
                        .ToListAsync(cancellationToken);

                    _context.GroupMembers.RemoveRange(existingMembers);
                    await _context.SaveChangesAsync(cancellationToken);

                    // Create new group members for each valid phone number
                    var groupMembers = validPhones
                        .Select(phone => new GroupMember
                        {
                            Id = Guid.NewGuid(),
                            GroupId = request.GroupId,
                            PhoneNumber = phone
                        })
                        .ToList();

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

            return true;
        }
    }
}
