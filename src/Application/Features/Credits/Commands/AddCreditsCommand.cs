using Application.DTOs;
using MediatR;

namespace Application.Features.Credits.Commands
{
    public class AddCreditsCommand : IRequest<CreditResponseDto>
    {
        public Guid ClientId { get; set; }
        public int Amount { get; set; }
        public string Reference { get; set; } = "Admin top-up";
    }
}