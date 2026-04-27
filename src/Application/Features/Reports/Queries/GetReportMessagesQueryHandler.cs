using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reports.Queries
{
    public class GetReportMessagesQueryHandler : IRequestHandler<GetReportMessagesQuery, ReportPageDto>
    {
        private readonly IApplicationDbContext _context;

        public GetReportMessagesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReportPageDto> Handle(GetReportMessagesQuery request, CancellationToken cancellationToken)
        {
            var page = request.Page < 1 ? 1 : request.Page;
            var pageSize = request.PageSize < 1 ? 20 : Math.Min(request.PageSize, 100);

            var query = _context.Messages
                .AsNoTracking()
                .ApplyReportFilters(
                    request.ClientId,
                    request.FromDate,
                    request.ToDate,
                    request.Status,
                    request.AllowedClientIds);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(message => message.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(message => new ReportItemDto
                {
                    PhoneNumber = message.PhoneNumber,
                    MessageContent = message.MessageContent,
                    Status = message.Status,
                    CreatedAt = message.CreatedAt,
                    SentAt = message.SentAt,
                })
                .ToListAsync(cancellationToken);

            return new ReportPageDto
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize),
            };
        }
    }
}