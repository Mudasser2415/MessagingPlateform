using System.Security.Claims;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services
{
    public class CurrentRequestContext : ICurrentRequestContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentRequestContext(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var principal = _httpContextAccessor.HttpContext?.User;
                var rawId = principal?.FindFirst("adminId")?.Value ?? principal?.FindFirst("userId")?.Value;
                return Guid.TryParse(rawId, out var userId) ? userId : null;
            }
        }

        public string? Role =>
            _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;

        public string UserName =>
            _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value ?? "System";

        public string? IpAddress => _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }
}