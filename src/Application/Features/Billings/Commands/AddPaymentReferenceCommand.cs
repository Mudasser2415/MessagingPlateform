using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Billings.Commands
{
    /// <summary>
    /// Records payment proof file metadata. File save/validation is done in the controller.
    /// </summary>
    public class AddPaymentReferenceCommand : IRequest<Guid>
    {
        public Guid BillingId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? UploadedBy { get; set; }
    }

    public class AddPaymentReferenceCommandHandler : IRequestHandler<AddPaymentReferenceCommand, Guid>
    {
        private readonly IApplicationDbContext _db;

        public AddPaymentReferenceCommandHandler(IApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<Guid> Handle(AddPaymentReferenceCommand request, CancellationToken ct)
        {
            bool billingExists = await _db.Billings.AnyAsync(b => b.Id == request.BillingId, ct);
            if (!billingExists)
                throw new InvalidOperationException("Billing record not found.");

            var reference = new PaymentReference
            {
                Id = Guid.NewGuid(),
                BillingId = request.BillingId,
                FileName = request.FileName,
                FileUrl = request.FileUrl,
                FileType = request.FileType,
                FileSize = request.FileSize,
                UploadedAt = DateTime.UtcNow,
                UploadedBy = request.UploadedBy,
            };

            _db.PaymentReferences.Add(reference);
            await _db.SaveChangesAsync(ct);

            return reference.Id;
        }
    }
}
