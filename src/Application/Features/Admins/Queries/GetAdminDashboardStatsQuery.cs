using Application.DTOs;
using MediatR;

namespace Application.Features.Admins.Queries
{
    public class GetAdminDashboardStatsQuery : IRequest<AdminDashboardStatsDto>
    {
    }
}
