using Application.Common.Interfaces;
using Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ClientEmployeeMappings
{
    internal static class ClientEmployeeMappingBuilders
    {
        public static async Task<MappingResponseDto?> BuildClientMappingAsync(
            IApplicationDbContext context,
            Guid clientId,
            CancellationToken cancellationToken)
        {
            var client = await context.Clients
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == clientId, cancellationToken);

            if (client == null)
            {
                return null;
            }

            var employees = await context.ClientEmployeeMappings
                .AsNoTracking()
                .Where(mapping => mapping.ClientId == clientId)
                .Include(mapping => mapping.User)
                .OrderBy(mapping => mapping.User.Name)
                .Select(mapping => new MappingEmployeeDto
                {
                    UserId = mapping.UserId,
                    Name = mapping.User.Name,
                    MobileNumber = mapping.User.MobileNumber,
                })
                .ToListAsync(cancellationToken);

            return new MappingResponseDto
            {
                ClientId = client.Id,
                ClientName = client.Name,
                Employees = employees,
            };
        }

        public static async Task<List<EmployeeAssignedClientDto>> BuildEmployeeClientsAsync(
            IApplicationDbContext context,
            Guid userId,
            CancellationToken cancellationToken)
        {
            return await context.ClientEmployeeMappings
                .AsNoTracking()
                .Where(mapping => mapping.UserId == userId)
                .Include(mapping => mapping.Client)
                .OrderBy(mapping => mapping.Client.Name)
                .Select(mapping => new EmployeeAssignedClientDto
                {
                    ClientId = mapping.ClientId,
                    ClientName = mapping.Client.Name,
                    MobileNumber = mapping.Client.MobileNumber,
                    Address = mapping.Client.Address,
                    Location = mapping.Client.Location,
                    BusinessType = mapping.Client.BusinessType,
                    PartnerId = mapping.Client.PartnerId,
                    CreatedAt = mapping.Client.CreatedAt,
                })
                .ToListAsync(cancellationToken);
        }
    }
}