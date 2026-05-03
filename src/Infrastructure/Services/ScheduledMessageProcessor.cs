using Application.Common.Interfaces;
using Application.Features.Messages.Commands;
using Domain.Enums;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class ScheduledMessageProcessor : IScheduledMessageProcessor
    {
        private const int MaxRetries = 3;

        private readonly IApplicationDbContext _context;
        private readonly IMediator _mediator;
        private readonly ILogger<ScheduledMessageProcessor> _logger;

        public ScheduledMessageProcessor(
            IApplicationDbContext context,
            IMediator mediator,
            ILogger<ScheduledMessageProcessor> logger)
        {
            _context = context;
            _mediator = mediator;
            _logger = logger;
        }

        [AutomaticRetry(Attempts = MaxRetries, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
        public async Task ProcessAsync(Guid scheduledMessageId)
        {
            var scheduled = await _context.ScheduledMessages
                .FirstOrDefaultAsync(s => s.Id == scheduledMessageId);

            if (scheduled == null)
            {
                _logger.LogWarning("ScheduledMessage {Id} not found — skipping.", scheduledMessageId);
                return;
            }

            // Allow re-entry for Hangfire retries (status may be Processing from previous attempt)
            if (scheduled.Status != ScheduledMessageStatus.Scheduled &&
                scheduled.Status != ScheduledMessageStatus.Processing)
            {
                _logger.LogInformation(
                    "ScheduledMessage {Id} is in status {Status} — skipping.",
                    scheduledMessageId, scheduled.Status);
                return;
            }

            scheduled.Status = ScheduledMessageStatus.Processing;
            await _context.SaveChangesAsync(CancellationToken.None);

            try
            {
                if (scheduled.GroupId.HasValue)
                {
                    await _mediator.Send(new SendGroupMessageCommand
                    {
                        ClientId = scheduled.ClientId,
                        TemplateId = scheduled.TemplateId,
                        GroupId = scheduled.GroupId.Value,
                    });
                }
                else
                {
                    // Fetch template content at execution time (credit check happens inside handler)
                    var template = await _context.Templates
                        .AsNoTracking()
                        .FirstOrDefaultAsync(t => t.TemplateId == scheduled.TemplateId)
                        ?? throw new InvalidOperationException(
                            $"Template '{scheduled.TemplateId}' no longer exists.");

                    await _mediator.Send(new CreateMessageCommand
                    {
                        ClientId = scheduled.ClientId,
                        TemplateId = scheduled.TemplateId,
                        PhoneNumber = scheduled.PhoneNumber ?? string.Empty,
                        MessageContent = template.TemplateContent,
                    });
                }

                scheduled.Status = ScheduledMessageStatus.Completed;
                scheduled.ProcessedAt = DateTime.UtcNow;
                scheduled.ErrorMessage = null;
                await _context.SaveChangesAsync(CancellationToken.None);

                _logger.LogInformation("ScheduledMessage {Id} completed successfully.", scheduledMessageId);
            }
            catch (Exception ex)
            {
                scheduled.RetryCount++;
                scheduled.ErrorMessage = ex.Message;

                if (scheduled.RetryCount >= MaxRetries)
                {
                    // Final failure — mark as failed and don't re-throw so Hangfire stops retrying
                    scheduled.Status = ScheduledMessageStatus.Failed;
                    await _context.SaveChangesAsync(CancellationToken.None);
                    _logger.LogError(ex,
                        "ScheduledMessage {Id} permanently failed after {Retries} attempts.",
                        scheduledMessageId, scheduled.RetryCount);
                }
                else
                {
                    // Reset to Scheduled so the next Hangfire retry attempt can re-enter
                    scheduled.Status = ScheduledMessageStatus.Scheduled;
                    await _context.SaveChangesAsync(CancellationToken.None);
                    _logger.LogWarning(ex,
                        "ScheduledMessage {Id} failed (attempt {Attempt}/{Max}), retrying.",
                        scheduledMessageId, scheduled.RetryCount, MaxRetries);
                    throw; // Let Hangfire retry
                }
            }
        }
    }
}
