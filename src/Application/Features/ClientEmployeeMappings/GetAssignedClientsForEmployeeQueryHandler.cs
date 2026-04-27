using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ClientEmployeeMappings
{
    public class GetAssignedClientsForEmployeeQueryHandler : IRequestHandler<GetAssignedClientsForEmployeeQuery, List<EmployeeAssignedClientDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAssignedClientsForEmployeeQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<EmployeeAssignedClientDto>> Handle(GetAssignedClientsForEmployeeQuery request, CancellationToken cancellationToken)
        {
            var employee = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(user => user.Id == request.UserId, cancellationToken)
                ?? throw new KeyNotFoundException("Employee not found.");

            if (!string.Equals(employee.Role, "Employee", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Assigned client lookups are only available for employees.");
            }

            return await ClientEmployeeMappingBuilders.BuildEmployeeClientsAsync(_context, request.UserId, cancellationToken);
        }
    }
}