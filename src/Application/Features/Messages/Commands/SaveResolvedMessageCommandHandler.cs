using Application.Common.Interfaces;
using Application.Common.Utilities;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Messages.Commands
{
    public class SaveResolvedMessageCommandHandler : IRequestHandler<SaveResolvedMessageCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public SaveResolvedMessageCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(SaveResolvedMessageCommand request, CancellationToken cancellationToken)
        {
            var clientExists = await _context.Clients
                .AsNoTracking()
                .AnyAsync(c => c.Id == request.ClientId, cancellationToken);

            if (!clientExists)
            {
                throw new KeyNotFoundException("Client not found.");
            }

            var templateExists = await _context.Templates
                .AsNoTracking()
                .AnyAsync(t => t.TemplateId == request.TemplateId, cancellationToken);

            if (!templateExists)
            {
                throw new KeyNotFoundException("Template not found.");
            }

            if (request.GroupId.HasValue)
            {
                var groupExists = await _context.Groups
                    .AsNoTracking()
                    .AnyAsync(g => g.GroupId == request.GroupId.Value && g.ClientId == request.ClientId, cancellationToken);

                if (!groupExists)
                {
                    throw new KeyNotFoundException("Group not found for the specified client.");
                }
            }

            var existingEntity = request.Id.HasValue
                ? await _context.SavedMessages
                    .FirstOrDefaultAsync(m => m.Id == request.Id.Value, cancellationToken)
                : null;

            SavedMessage entity;
            if (existingEntity is not null)
            {
                entity = existingEntity;
                entity.ClientId = request.ClientId;
                entity.TemplateId = request.TemplateId;
                entity.GroupId = request.GroupId;
                entity.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber)
                    ? string.Empty
                    : MobileNumberHelper.Normalize(request.PhoneNumber);
                entity.MessageContent = request.MessageContent.Trim();
            }
            else
            {
                entity = new SavedMessage
                {
                    Id = request.Id.GetValueOrDefault() == Guid.Empty
                        ? Guid.NewGuid()
                        : request.Id.GetValueOrDefault(),
                    ClientId = request.ClientId,
                    TemplateId = request.TemplateId,
                    GroupId = request.GroupId,
                    PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber)
                        ? string.Empty
                        : MobileNumberHelper.Normalize(request.PhoneNumber),
                    MessageContent = request.MessageContent.Trim(),
                    CreatedAt = DateTime.UtcNow,
                };

                _context.SavedMessages.Add(entity);
            }

            await _context.SaveChangesAsync(cancellationToken);

            return entity.Id;
        }
    }
}
