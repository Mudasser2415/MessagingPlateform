using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;

namespace Application.Features.Admins.Queries
{
    public class GetAdminClientByIdQueryHandler : IRequestHandler<GetAdminClientByIdQuery, AdminClientDetailDto?>
    {
        private readonly IApplicationDbContext _context;

        public GetAdminClientByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public Task<AdminClientDetailDto?> Handle(GetAdminClientByIdQuery request, CancellationToken cancellationToken)
        {
            return AdminClientDetailBuilder.BuildAsync(_context, request.ClientId, cancellationToken);
        }
    }
}