using Domain.Entities;

namespace Application.Common.Services
{
    public interface ITokenService
    {
        string GenerateForUser(User user, Guid? partnerId = null);
        string GenerateForAdmin(Admin admin);
    }
}