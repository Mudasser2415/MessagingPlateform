using Application.Common.Interfaces;
using Application.DTOs;
using Application.Features.Quotations.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Quotations.Queries
{
    public class GetQuotationByIdQuery : IRequest<QuotationDto>
    {
        public Guid QuotationId { get; set; }
    }

    public class GetQuotationByIdQueryHandler
        : IRequestHandler<GetQuotationByIdQuery, QuotationDto>
    {
        private readonly IApplicationDbContext _db;

        public GetQuotationByIdQueryHandler(IApplicationDbContext db) => _db = db;

        public async Task<QuotationDto> Handle(
            GetQuotationByIdQuery request,
            CancellationToken cancellationToken)
        {
            var quotation = await _db.Quotations
                .AsNoTracking()
                .Include(q => q.Client)
                .Include(q => q.SubscriptionPlan)
                .FirstOrDefaultAsync(q => q.Id == request.QuotationId, cancellationToken)
                ?? throw new KeyNotFoundException($"Quotation {request.QuotationId} not found.");

            return CreateQuotationCommandHandler.MapToDto(
                quotation, quotation.Client!.Name, quotation.SubscriptionPlan!);
        }
    }
}
