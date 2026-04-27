using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class AuditLogResponseDto
    {
        public Guid Id { get; set; }
        public string EntityName { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
        public string Action { get; set; } = string.Empty;
        public Guid? PerformedBy { get; set; }
        public string PerformedByName { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? IpAddress { get; set; }
    }

    public class AuditLogPageResponseDto
    {
        public IReadOnlyList<AuditLogResponseDto> Items { get; set; } = Array.Empty<AuditLogResponseDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}