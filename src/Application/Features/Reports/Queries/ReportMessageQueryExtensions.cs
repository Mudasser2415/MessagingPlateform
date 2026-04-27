using Domain.Entities;

namespace Application.Features.Reports.Queries
{
    internal static class ReportMessageQueryExtensions
    {
        public static IQueryable<Message> ApplyReportFilters(
            this IQueryable<Message> query,
            Guid? clientId,
            DateTime? fromDate,
            DateTime? toDate,
            string? status,
            IReadOnlyCollection<Guid>? allowedClientIds)
        {
            if (clientId.HasValue)
            {
                query = query.Where(message => message.ClientId == clientId.Value);
            }

            if (allowedClientIds is { Count: > 0 })
            {
                query = query.Where(message => allowedClientIds.Contains(message.ClientId));
            }

            if (allowedClientIds is { Count: 0 })
            {
                return query.Where(_ => false);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(message => message.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                var inclusiveToDate = toDate.Value;
                if (inclusiveToDate.TimeOfDay == TimeSpan.Zero)
                {
                    inclusiveToDate = inclusiveToDate.Date.AddDays(1).AddTicks(-1);
                }

                query = query.Where(message => message.CreatedAt <= inclusiveToDate);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim().ToLower();
                query = query.Where(message => message.Status.ToLower() == normalizedStatus);
            }

            return query;
        }
    }
}