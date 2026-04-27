using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Features.Credits.Commands
{
    public class AddCreditsCommandHandler : IRequestHandler<AddCreditsCommand, CreditResponseDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly ILogger<AddCreditsCommandHandler> _logger;

        public AddCreditsCommandHandler(
            IApplicationDbContext context,
            ILogger<AddCreditsCommandHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CreditResponseDto> Handle(AddCreditsCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation(
                "Starting credit top-up for client {ClientId} with amount {Amount}",
                request.ClientId,
                request.Amount);

            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                var client = await _context.Clients
                    .FirstOrDefaultAsync(currentClient => currentClient.Id == request.ClientId, cancellationToken)
                    ?? throw new KeyNotFoundException("Client not found.");

                if (request.Amount > int.MaxValue - client.AvailableCredits)
                {
                    _logger.LogWarning(
                        "Credit top-up rejected for client {ClientId} because amount {Amount} would exceed allowed balance",
                        request.ClientId,
                        request.Amount);
                    throw new InvalidOperationException("Credit limit exceeded.");
                }

                client.AvailableCredits += request.Amount;

                _context.CreditTransactions.Add(new CreditTransaction
                {
                    Id = Guid.NewGuid(),
                    ClientId = client.Id,
                    Type = CreditTransactionType.Credit,
                    Amount = request.Amount,
                    BalanceAfter = client.AvailableCredits,
                    Reference = string.IsNullOrWhiteSpace(request.Reference) ? "Admin top-up" : request.Reference.Trim(),
                    CreatedAt = DateTime.UtcNow,
                });

                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation(
                    "Credit top-up completed for client {ClientId}. New balance is {AvailableCredits}",
                    client.Id,
                    client.AvailableCredits);

                return new CreditResponseDto
                {
                    ClientId = client.Id,
                    AvailableCredits = client.AvailableCredits,
                };
            }
            catch (DbUpdateConcurrencyException ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.LogError(
                    ex,
                    "Credit top-up concurrency conflict for client {ClientId} with amount {Amount}",
                    request.ClientId,
                    request.Amount);
                throw new InvalidOperationException("The client credit balance changed during the update. Please retry.", ex);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.LogError(
                    ex,
                    "Credit top-up failed for client {ClientId} with amount {Amount}",
                    request.ClientId,
                    request.Amount);
                throw;
            }
        }
    }
}