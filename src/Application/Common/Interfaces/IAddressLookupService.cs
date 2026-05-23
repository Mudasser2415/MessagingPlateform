using Application.DTOs;

namespace Application.Common.Interfaces
{
    public interface IAddressLookupService
    {
        Task<AddressLookupResponseDto?> LookupAsync(string pinCode, CancellationToken cancellationToken = default);
    }
}
