using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.ScheduledMessages.Commands
{
    public class ScheduleMessageCommandHandler : IRequestHandler<ScheduleMessageCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IJobScheduler _jobScheduler;

        public ScheduleMessageCommandHandler(
            IApplicationDbContext context,
            IJobScheduler jobScheduler)
        {
            _context = context;
            _jobScheduler = jobScheduler;
        }

        public async Task<Guid> Handle(ScheduleMessageCommand request, CancellationToken cancellationToken)
        {
            var clientExists = await _context.Clients
                .AnyAsync(c => c.Id == request.ClientId, cancellationToken);
            if (!clientExists)
                throw new KeyNotFoundException($"Client '{request.ClientId}' not found.");

            var templateExists = await _context.Templates
                .AnyAsync(t => t.TemplateId == request.TemplateId && t.ClientId == request.ClientId, cancellationToken);
            if (!templateExists)
                throw new KeyNotFoundException($"Template '{request.TemplateId}' not found for this client.");

            if (request.GroupId.HasValue)
            {
                var groupExists = await _context.Groups
                    .AnyAsync(g => g.GroupId == request.GroupId && g.ClientId == request.ClientId, cancellationToken);
                if (!groupExists)
                    throw new KeyNotFoundException($"Group '{request.GroupId}' not found for this client.");
            }

            var scheduledMessage = new ScheduledMessage
            {
                Id = Guid.NewGuid(),
                ClientId = request.ClientId,
                TemplateId = request.TemplateId,
                GroupId = request.GroupId,
                PhoneNumber = request.PhoneNumber,
                ScheduledAt = request.ScheduledAt.ToUniversalTime(),
                Status = ScheduledMessageStatus.Scheduled,
                CreatedAt = DateTime.UtcNow,
            };

            _context.ScheduledMessages.Add(scheduledMessage);
            await _context.SaveChangesAsync(cancellationToken);

            // Register the Hangfire job — scheduled relative to UTC now
            var runAt = new DateTimeOffset(scheduledMessage.ScheduledAt, TimeSpan.Zero);
            var jobId = _jobScheduler.ScheduleMessage(scheduledMessage.Id, runAt);

            scheduledMessage.HangfireJobId = jobId;
            await _context.SaveChangesAsync(cancellationToken);

            return scheduledMessage.Id;
        }
    }
}
