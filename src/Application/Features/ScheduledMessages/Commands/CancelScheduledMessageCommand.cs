using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.ScheduledMessages.Commands
{
    public class CancelScheduledMessageCommand : IRequest
    {
        public Guid Id { get; set; }
    }

    public class CancelScheduledMessageCommandHandler : IRequestHandler<CancelScheduledMessageCommand>
    {
        private readonly IApplicationDbContext _context;
        private readonly IJobScheduler _jobScheduler;

        public CancelScheduledMessageCommandHandler(
            IApplicationDbContext context,
            IJobScheduler jobScheduler)
        {
            _context = context;
            _jobScheduler = jobScheduler;
        }

        public async Task Handle(CancelScheduledMessageCommand request, CancellationToken cancellationToken)
        {
            var scheduled = await _context.ScheduledMessages
                .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Scheduled message '{request.Id}' not found.");

            if (scheduled.Status != ScheduledMessageStatus.Scheduled)
                throw new InvalidOperationException(
                    $"Only messages with status 'Scheduled' can be cancelled. Current status: '{scheduled.Status}'.");

            if (!string.IsNullOrWhiteSpace(scheduled.HangfireJobId))
                _jobScheduler.Delete(scheduled.HangfireJobId);

            scheduled.Status = ScheduledMessageStatus.Cancelled;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
