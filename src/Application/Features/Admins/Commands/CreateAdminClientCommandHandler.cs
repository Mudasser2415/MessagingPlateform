using Application.Common.Interfaces;
using Application.Common.Utilities;
using Application.DTOs;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace Application.Features.Admins.Commands
{
    public class CreateAdminClientCommandHandler : IRequestHandler<CreateAdminClientCommand, AdminClientDetailDto>
    {
        private readonly IApplicationDbContext _context;

        public CreateAdminClientCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AdminClientDetailDto> Handle(CreateAdminClientCommand request, CancellationToken cancellationToken)
        {
            if (request.PartnerId.HasValue)
            {
                var partnerExists = await _context.Partners
                    .AsNoTracking()
                    .AnyAsync(partner => partner.Id == request.PartnerId.Value, cancellationToken);

                if (!partnerExists)
                {
                    throw new KeyNotFoundException("Selected partner was not found.");
                }
            }

            var client = new Client
            {
                Id = Guid.NewGuid(),
                PartnerId = request.PartnerId,
                Name = request.Name.Trim(),
                MobileNumber = MobileNumberHelper.Normalize(request.MobileNumber),
                Address = request.Address.Trim(),
                Location = request.Location.Trim(),
                BusinessType = request.BusinessType.Trim(),
                EmailId = request.EmailId?.Trim() ?? string.Empty,
                Password = GenerateTemporaryPassword(),
                CreatedAt = DateTime.UtcNow,
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync(cancellationToken);

            return await AdminClientDetailBuilder.BuildAsync(_context, client.Id, cancellationToken)
                ?? throw new InvalidOperationException("Client was created but could not be loaded.");
        }

        private static string GenerateTemporaryPassword()
        {
            const string characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
            var buffer = new char[14];

            for (var index = 0; index < buffer.Length; index++)
            {
                buffer[index] = characters[RandomNumberGenerator.GetInt32(characters.Length)];
            }

            return new string(buffer);
        }
    }
}