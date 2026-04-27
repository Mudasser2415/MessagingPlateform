using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.AuditLogs.Queries
{
    public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, AuditLogPageResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public GetAuditLogsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AuditLogPageResponseDto> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
        {
            var page = request.Page < 1 ? 1 : request.Page;
            var pageSize = request.PageSize < 1 ? 20 : Math.Min(request.PageSize, 100);

            var query = _context.AuditLogs
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.EntityName))
            {
                var entityName = request.EntityName.Trim();
                query = query.Where(log => log.EntityName == entityName);
            }

            if (!string.IsNullOrWhiteSpace(request.Action))
            {
                var action = request.Action.Trim();
                query = query.Where(log => log.Action == action);
            }

            if (!string.IsNullOrWhiteSpace(request.PerformedBy))
            {
                var performedBy = request.PerformedBy.Trim();
                if (Guid.TryParse(performedBy, out var performedById))
                {
                    query = query.Where(log => log.PerformedBy == performedById || log.PerformedByName.Contains(performedBy));
                }
                else
                {
                    query = query.Where(log => log.PerformedByName.Contains(performedBy));
                }
            }

            if (request.FromDate.HasValue)
            {
                var fromDate = request.FromDate.Value.ToUniversalTime();
                query = query.Where(log => log.Timestamp >= fromDate);
            }

            if (request.ToDate.HasValue)
            {
                var toDate = request.ToDate.Value.ToUniversalTime();
                query = query.Where(log => log.Timestamp <= toDate);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(log => log.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(log => new AuditLogResponseDto
                {
                    Id = log.Id,
                    EntityName = log.EntityName,
                    EntityId = log.EntityId,
                    Action = log.Action,
                    PerformedBy = log.PerformedBy,
                    PerformedByName = log.PerformedByName,
                    Timestamp = log.Timestamp,
                    OldValues = log.OldValues,
                    NewValues = log.NewValues,
                    IpAddress = log.IpAddress
                })
                .ToListAsync(cancellationToken);

            return new AuditLogPageResponseDto
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }
    }
}