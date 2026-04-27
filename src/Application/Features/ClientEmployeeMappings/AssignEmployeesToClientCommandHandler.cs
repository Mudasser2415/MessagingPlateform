using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ClientEmployeeMappings
{
    public class AssignEmployeesToClientCommandHandler : IRequestHandler<AssignEmployeesToClientCommand, MappingResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public AssignEmployeesToClientCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MappingResponseDto> Handle(AssignEmployeesToClientCommand request, CancellationToken cancellationToken)
        {
            var normalizedUserIds = request.UserIds
                .Where(userId => userId != Guid.Empty)
                .Distinct()
                .ToList();

            if (normalizedUserIds.Count == 0)
            {
                throw new InvalidOperationException("At least one employee user id is required.");
            }

            var clientExists = await _context.Clients
                .AsNoTracking()
                .AnyAsync(client => client.Id == request.ClientId, cancellationToken);

            if (!clientExists)
            {
                throw new KeyNotFoundException("Client not found.");
            }

            var employees = await _context.Users
                .Where(user => normalizedUserIds.Contains(user.Id))
                .ToListAsync(cancellationToken);

            if (employees.Count != normalizedUserIds.Count)
            {
                throw new KeyNotFoundException("One or more employees were not found.");
            }

            if (employees.Any(user => !string.Equals(user.Role, "Employee", StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException("Mappings can only be created for users with the Employee role.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                var existingUserIds = await _context.ClientEmployeeMappings
                    .Where(mapping => mapping.ClientId == request.ClientId && normalizedUserIds.Contains(mapping.UserId))
                    .Select(mapping => mapping.UserId)
                    .ToListAsync(cancellationToken);

                var newMappings = normalizedUserIds
                    .Except(existingUserIds)
                    .Select(userId => new ClientEmployeeMapping
                    {
                        Id = Guid.NewGuid(),
                        ClientId = request.ClientId,
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow,
                    })
                    .ToList();

                if (newMappings.Count > 0)
                {
                    _context.ClientEmployeeMappings.AddRange(newMappings);
                    await _context.SaveChangesAsync(cancellationToken);
                }

                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }

            return await ClientEmployeeMappingBuilders.BuildClientMappingAsync(
                       _context,
                       request.ClientId,
                       cancellationToken)
                   ?? throw new KeyNotFoundException("Client not found.");
        }
    }
}