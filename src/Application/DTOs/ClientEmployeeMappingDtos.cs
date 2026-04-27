namespace Application.DTOs
{
    public class CreateMappingDto
    {
        public Guid ClientId { get; set; }
        public List<Guid> UserIds { get; set; } = new();
    }

    public class RemoveClientEmployeeMappingDto
    {
        public Guid ClientId { get; set; }
        public Guid UserId { get; set; }
    }

    public class MappingEmployeeDto
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
    }

    public class MappingResponseDto
    {
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public List<MappingEmployeeDto> Employees { get; set; } = new();
    }

    public class EmployeeAssignedClientDto
    {
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public Guid? PartnerId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}