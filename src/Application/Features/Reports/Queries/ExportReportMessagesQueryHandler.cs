using System.Text;
using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Reports.Queries
{
    public class ExportReportMessagesQueryHandler : IRequestHandler<ExportReportMessagesQuery, string>
    {
        private readonly IApplicationDbContext _context;

        public ExportReportMessagesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> Handle(ExportReportMessagesQuery request, CancellationToken cancellationToken)
        {
            var messages = await _context.Messages
                .AsNoTracking()
                .ApplyReportFilters(
                    request.ClientId,
                    request.FromDate,
                    request.ToDate,
                    request.Status,
                    request.AllowedClientIds)
                .OrderByDescending(message => message.CreatedAt)
                .Select(message => new
                {
                    message.PhoneNumber,
                    message.MessageContent,
                    message.Status,
                    message.CreatedAt,
                    message.SentAt,
                })
                .ToListAsync(cancellationToken);

            var builder = new StringBuilder();
            builder.AppendLine("PhoneNumber,MessageContent,Status,CreatedAt,SentAt");

            foreach (var message in messages)
            {
                builder.AppendLine(string.Join(",",
                    EscapeCsv(message.PhoneNumber),
                    EscapeCsv(message.MessageContent),
                    EscapeCsv(message.Status),
                    EscapeCsv(message.CreatedAt.ToString("O")),
                    EscapeCsv(message.SentAt?.ToString("O") ?? string.Empty)));
            }

            return builder.ToString();
        }

        private static string EscapeCsv(string value)
        {
            if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
            {
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }

            return value;
        }
    }
}