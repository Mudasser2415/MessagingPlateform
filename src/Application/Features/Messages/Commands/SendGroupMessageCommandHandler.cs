using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Messages.Commands
{
    public class SendGroupMessageCommandHandler : IRequestHandler<SendGroupMessageCommand, SendGroupMessageResponse>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMessageQueuePublisher _queuePublisher;
        private readonly ILogger<SendGroupMessageCommandHandler> _logger;

        public SendGroupMessageCommandHandler(
            IApplicationDbContext context,
            IMessageQueuePublisher queuePublisher,
            ILogger<SendGroupMessageCommandHandler> logger)
        {
            _context = context;
            _queuePublisher = queuePublisher;
            _logger = logger;
        }

        public async Task<SendGroupMessageResponse> Handle(
            SendGroupMessageCommand request,
            CancellationToken cancellationToken)
        {
            // Step 1: Validate client (tracked for credit deduction)
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == request.ClientId, cancellationToken)
                ?? throw new KeyNotFoundException($"Client '{request.ClientId}' not found.");

            // Step 2: Validate template belongs to client
            var template = await _context.Templates
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    t => t.TemplateId == request.TemplateId && t.ClientId == request.ClientId,
                    cancellationToken)
                ?? throw new KeyNotFoundException($"Template '{request.TemplateId}' not found for this client.");

            // Step 3: Validate group belongs to client
            var groupExists = await _context.Groups
                .AsNoTracking()
                .AnyAsync(
                    g => g.GroupId == request.GroupId && g.ClientId == request.ClientId,
                    cancellationToken);

            if (!groupExists)
                throw new KeyNotFoundException($"Group '{request.GroupId}' not found for this client.");

            // Step 4: Fetch unique, non-empty member phone numbers
            var memberPhones = await _context.GroupMembers
                .AsNoTracking()
                .Where(m => m.GroupId == request.GroupId && m.PhoneNumber != string.Empty)
                .Select(m => m.PhoneNumber)
                .Distinct()
                .ToListAsync(cancellationToken);

            if (memberPhones.Count == 0)
                throw new InvalidOperationException("The group has no members. Add members before sending.");

            // Step 5: Credit check
            if (client.AvailableCredits < memberPhones.Count)
                throw new InvalidOperationException(
                    $"Insufficient credits. Required: {memberPhones.Count}, Available: {client.AvailableCredits}.");

            // Steps 6–8: Create messages + deduct credits inside a transaction
            List<Guid> messageIds;
            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var createdAt = DateTime.UtcNow;
                var messages = memberPhones
                    .Select(phone => new Message
                    {
                        Id = Guid.NewGuid(),
                        ClientId = request.ClientId,
                        TemplateId = request.TemplateId,
                        GroupId = request.GroupId,
                        PhoneNumber = phone,
                        MessageContent = template.TemplateContent,
                        Status = MessageStatuses.Pending,
                        CreatedAt = createdAt,
                    })
                    .ToList();

                _context.Messages.AddRange(messages);

                // Deduct credits (optimistic concurrency via RowVersion on Client)
                client.AvailableCredits -= memberPhones.Count;

                _context.CreditTransactions.Add(new CreditTransaction
                {
                    Id = Guid.NewGuid(),
                    ClientId = client.Id,
                    Type = CreditTransactionType.Debit,
                    Amount = memberPhones.Count,
                    BalanceAfter = client.AvailableCredits,
                    Reference = $"GroupSend:Group:{request.GroupId}:Template:{request.TemplateId}",
                    CreatedAt = createdAt,
                });

                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                messageIds = messages.Select(m => m.Id).ToList();

                _logger.LogInformation(
                    "Created {Count} messages for Group '{GroupId}' (Client: {ClientId}). Credits remaining: {Credits}.",
                    messageIds.Count, request.GroupId, request.ClientId, client.AvailableCredits);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new InvalidOperationException(
                    "The client credit balance changed during processing. Please retry.", ex);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }

            // Step 9: Publish message IDs to queue (outside transaction — fire-and-continue)
            try
            {
                await _queuePublisher.PublishAsync(messageIds, cancellationToken);
            }
            catch (Exception ex)
            {
                // Queue publish failure is non-fatal: messages are Pending in DB and can be
                // re-enqueued by a reconciliation job. Log and continue.
                _logger.LogError(ex,
                    "Failed to publish {Count} message IDs to queue. Messages remain 'Pending' and must be re-queued.",
                    messageIds.Count);
            }

            return new SendGroupMessageResponse
            {
                TotalMessages = messageIds.Count,
                Status = "Queued",
            };
        }
    }

    /// <summary>Constants for message status strings to avoid magic strings across the codebase.</summary>
    public static class MessageStatuses
    {
        public const string Pending = "Pending";
        public const string Sent = "Sent";
        public const string Failed = "Failed";
        public const string Delivered = "Delivered";
    }
}
