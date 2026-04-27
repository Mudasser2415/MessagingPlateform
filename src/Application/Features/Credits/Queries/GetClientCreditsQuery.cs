using Application.DTOs;
using MediatR;

namespace Application.Features.Credits.Queries
{
    public class GetClientCreditsQuery : IRequest<CreditResponseDto?>
    {
        public Guid ClientId { get; set; }
    }
}