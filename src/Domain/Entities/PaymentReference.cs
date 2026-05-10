namespace Domain.Entities
{
    /// <summary>
    /// Metadata record for a payment proof file uploaded against a Billing.
    /// The actual file is stored on disk; this entity tracks the path and metadata.
    /// </summary>
    public class PaymentReference
    {
        public Guid Id { get; set; }
        public Guid BillingId { get; set; }

        public string FileName { get; set; } = string.Empty;

        /// <summary>Server-relative URL, e.g. /uploads/payments/abc123.jpg</summary>
        public string FileUrl { get; set; } = string.Empty;

        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }

        public DateTime UploadedAt { get; set; }
        public string? UploadedBy { get; set; }

        // Navigation
        public Billing? Billing { get; set; }
    }
}
