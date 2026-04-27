namespace Application.DTOs
{
    public class RegisterUserDto
    {
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee"; // Admin or Employee
        public bool CanCreatePartners { get; set; }
    }

    public class LoginDto
    {
        public string MobileNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginByEmailDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public Guid? PartnerId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public bool CanCreatePartners { get; set; }
    }

    public class UserDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool CanCreatePartners { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
