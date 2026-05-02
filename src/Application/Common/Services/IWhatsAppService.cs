using System.Threading;
using System.Threading.Tasks;

namespace Application.Common.Services
{
    public record WhatsAppSendResult(bool Success, string? ErrorMessage = null);

    /// <summary>
    /// Sends a WhatsApp message to a single recipient.
    /// </summary>
    public interface IWhatsAppService
    {
        Task<WhatsAppSendResult> SendAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);
    }
}
