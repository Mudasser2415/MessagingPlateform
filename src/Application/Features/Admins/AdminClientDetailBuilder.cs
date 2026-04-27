using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admins
{
    internal static class AdminClientDetailBuilder
    {
        public static async Task<AdminClientDetailDto?> BuildAsync(
            IApplicationDbContext context,
            Guid clientId,
            CancellationToken cancellationToken)
        {
            var client = await context.Clients
                .AsNoTracking()
                .Include(c => c.Partner!)
                .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(c => c.Id == clientId, cancellationToken);

            if (client == null)
            {
                return null;
            }

            var groupCount = await context.Groups
                .CountAsync(group => group.ClientId == client.Id, cancellationToken);

            var messageCount = await context.Messages
                .CountAsync(message => message.ClientId == client.Id, cancellationToken);

            return new AdminClientDetailDto
            {
                Id = client.Id,
                PartnerId = client.PartnerId,
                PartnerName = client.Partner?.User.Name,
                PartnerCompanyName = client.Partner?.CompanyName,
                Name = client.Name,
                Email = client.EmailId,
                MobileNumber = client.MobileNumber,
                Address = client.Address,
                BusinessType = client.BusinessType,
                Location = client.Location,
                AvailableCredits = client.AvailableCredits,
                GroupCount = groupCount,
                MessageCount = messageCount,
                CreatedAt = client.CreatedAt,
            };
        }

        public static async Task<List<AdminClientDetailDto>> BuildManyAsync(
            IApplicationDbContext context,
            IReadOnlyCollection<Client> clients,
            CancellationToken cancellationToken)
        {
            if (clients.Count == 0)
            {
                return new List<AdminClientDetailDto>();
            }

            var clientIds = clients.Select(client => client.Id).ToArray();

            var groupCounts = await context.Groups
                .AsNoTracking()
                .Where(group => clientIds.Contains(group.ClientId))
                .GroupBy(group => group.ClientId)
                .Select(group => new { ClientId = group.Key, Count = group.Count() })
                .ToDictionaryAsync(item => item.ClientId, item => item.Count, cancellationToken);

            var messageCounts = await context.Messages
                .AsNoTracking()
                .Where(message => clientIds.Contains(message.ClientId))
                .GroupBy(message => message.ClientId)
                .Select(group => new { ClientId = group.Key, Count = group.Count() })
                .ToDictionaryAsync(item => item.ClientId, item => item.Count, cancellationToken);

            return clients
                .Select(client => new AdminClientDetailDto
                {
                    Id = client.Id,
                    PartnerId = client.PartnerId,
                    PartnerName = client.Partner?.User.Name,
                    PartnerCompanyName = client.Partner?.CompanyName,
                    Name = client.Name,
                    Email = client.EmailId,
                    MobileNumber = client.MobileNumber,
                    Address = client.Address,
                    BusinessType = client.BusinessType,
                    Location = client.Location,
                    AvailableCredits = client.AvailableCredits,
                    GroupCount = groupCounts.GetValueOrDefault(client.Id),
                    MessageCount = messageCounts.GetValueOrDefault(client.Id),
                    CreatedAt = client.CreatedAt,
                })
                .ToList();
        }
    }
}