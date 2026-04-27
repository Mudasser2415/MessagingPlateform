using Application.Common.Interfaces;
using Application.Common.Utilities;
using Domain.Enums;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Messages.Commands
{
    public class CreateMessageCommandHandler : IRequestHandler<CreateMessageCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateMessageCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateMessageCommand request, CancellationToken cancellationToken)
        {
            var recipients = await ResolveRecipientsAsync(request, cancellationToken);
            if (recipients.Count == 0)
            {
                throw new InvalidOperationException("No valid recipients were found for this message request.");
            }

            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                var client = await _context.Clients
                    .FirstOrDefaultAsync(currentClient => currentClient.Id == request.ClientId, cancellationToken)
                    ?? throw new KeyNotFoundException("Client not found.");

                if (client.AvailableCredits < recipients.Count)
                {
                    throw new InvalidOperationException("Insufficient credits");
                }

                client.AvailableCredits -= recipients.Count;

                var createdAt = DateTime.UtcNow;
                var messages = recipients
                    .Select(phoneNumber => new Message
                    {
                        Id = Guid.NewGuid(),
                        ClientId = request.ClientId,
                        TemplateId = request.TemplateId,
                        GroupId = request.GroupId,
                        PhoneNumber = phoneNumber,
                        MessageContent = request.MessageContent,
                        Status = "Pending",
                        CreatedAt = createdAt,
                    })
                    .ToList();

                _context.Messages.AddRange(messages);

                _context.CreditTransactions.Add(new CreditTransaction
                {
                    Id = Guid.NewGuid(),
                    ClientId = client.Id,
                    Type = CreditTransactionType.Debit,
                    Amount = recipients.Count,
                    BalanceAfter = client.AvailableCredits,
                    Reference = BuildReference(request, messages),
                    CreatedAt = createdAt,
                });

                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                return messages[0].Id;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new InvalidOperationException("The client credit balance changed during processing. Please retry.", ex);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        private async Task<List<string>> ResolveRecipientsAsync(CreateMessageCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                if (request.GroupId.HasValue)
                {
                    var groupExists = await _context.Groups
                        .AsNoTracking()
                        .AnyAsync(group => group.GroupId == request.GroupId.Value && group.ClientId == request.ClientId, cancellationToken);

                    if (!groupExists)
                    {
                        throw new KeyNotFoundException("Group not found for the specified client.");
                    }
                }

                return [MobileNumberHelper.Normalize(request.PhoneNumber)];
            }

            if (!request.GroupId.HasValue)
            {
                return [];
            }

            var groupBelongsToClient = await _context.Groups
                .AsNoTracking()
                .AnyAsync(group => group.GroupId == request.GroupId.Value && group.ClientId == request.ClientId, cancellationToken);

            if (!groupBelongsToClient)
            {
                throw new KeyNotFoundException("Group not found for the specified client.");
            }

            return await _context.GroupMembers
                .AsNoTracking()
                .Where(member => member.GroupId == request.GroupId.Value)
                .Select(member => MobileNumberHelper.Normalize(member.PhoneNumber))
                .ToListAsync(cancellationToken);
        }

        private static string BuildReference(CreateMessageCommand request, IReadOnlyList<Message> messages)
        {
            if (messages.Count == 1)
            {
                return messages[0].Id.ToString();
            }

            return request.GroupId.HasValue
                ? $"Group:{request.GroupId.Value}"
                : $"Bulk:{request.ClientId}";
        }
    }
}
