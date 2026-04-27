using System;

namespace Application.Common.Interfaces
{
    public interface ICurrentRequestContext
    {
        Guid? UserId { get; }
        string? Role { get; }
        string UserName { get; }
        string? IpAddress { get; }
        bool IsAuthenticated { get; }
    }
}