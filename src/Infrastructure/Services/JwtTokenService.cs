using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Common.Services;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services
{
    public class JwtTokenService : ITokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateForUser(User user, Guid? partnerId = null)
        {
            var claims = new List<Claim>
            {
                new("userId", user.Id.ToString()),
                new("mobileNumber", user.MobileNumber),
                new(ClaimTypes.Role, user.Role),
                new(ClaimTypes.Name, user.Name),
                new("canCreatePartners", user.CanCreatePartners.ToString())
            };

            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                claims.Add(new Claim(ClaimTypes.Email, user.Email));
            }

            if (partnerId.HasValue)
            {
                claims.Add(new Claim("partnerId", partnerId.Value.ToString()));
            }

            return GenerateToken(claims);
        }

        public string GenerateForAdmin(Admin admin)
        {
            var claims = new List<Claim>
            {
                new("adminId", admin.Id.ToString()),
                new(ClaimTypes.Email, admin.Email),
                new(ClaimTypes.Role, admin.Role),
                new(ClaimTypes.Name, admin.FullName),
                new("type", "admin")
            };

            return GenerateToken(claims);
        }

        private string GenerateToken(IEnumerable<Claim> claims)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key not configured")));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpiryMinutes"] ?? "60")),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}