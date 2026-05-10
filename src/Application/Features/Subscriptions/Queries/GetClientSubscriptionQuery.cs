using Application.Common.Interfaces;
using Application.DTOs;
using Application.Features.Subscriptions.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Subscriptions.Queries
{
    public class GetClientSubscriptionQuery : IRequest<ClientSubscriptionDto?>
    {
        public Guid ClientId { get; set; }
    }

    public class GetClientSubscriptionQueryHandler
        : IRequestHandler<GetClientSubscriptionQuery, ClientSubscriptionDto?>
    {
        private readonly IApplicationDbContext _db;

        public GetClientSubscriptionQueryHandler(IApplicationDbContext db) => _db = db;

        public async Task<ClientSubscriptionDto?> Handle(
            GetClientSubscriptionQuery request, CancellationToken cancellationToken)
        {
            var sub = await _db.ClientSubscriptions
                .AsNoTracking()
                .Include(s => s.SubscriptionPlan)
                .Include(s => s.Client)
                .Where(s => s.ClientId == request.ClientId)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (sub is null) return null;

            return AssignSubscriptionCommandHandler.MapToDto(sub, sub.Client!.Name, sub.SubscriptionPlan!);
        }
    }
}
