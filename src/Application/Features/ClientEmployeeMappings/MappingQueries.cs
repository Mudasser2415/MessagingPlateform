using Application.DTOs;
using MediatR;

namespace Application.Features.ClientEmployeeMappings
{
    public class AssignEmployeesToClientCommand : IRequest<MappingResponseDto>
    {
        public Guid ClientId { get; set; }
        public List<Guid> UserIds { get; set; } = new();
    }

    public class GetClientEmployeeMappingsByClientQuery : IRequest<MappingResponseDto?>
    {
        public Guid ClientId { get; set; }
    }

    public class GetAssignedClientsForEmployeeQuery : IRequest<List<EmployeeAssignedClientDto>>
    {
        public Guid UserId { get; set; }
    }

    public class RemoveClientEmployeeMappingCommand : IRequest<bool>
    {
        public Guid ClientId { get; set; }
        public Guid UserId { get; set; }
    }
}