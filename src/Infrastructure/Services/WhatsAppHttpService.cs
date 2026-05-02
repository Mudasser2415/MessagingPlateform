using Application.Common.Services;
using Infrastructure.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    /// <summary>
    /// Calls the external WhatsApp Node.js service to send a single message.
    /// POST {BaseUrl}{SendEndpoint}  Body: { "phone": "...", "message": "..." }
    /// </summary>
    public sealed class WhatsAppHttpService : IWhatsAppService
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly WhatsAppSettings _settings;
        private readonly ILogger<WhatsAppHttpService> _logger;

        public WhatsAppHttpService(
            IHttpClientFactory httpClientFactory,
            IOptions<WhatsAppSettings> settings,
            ILogger<WhatsAppHttpService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<WhatsAppSendResult> SendAsync(
            string phoneNumber,
            string message,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("WhatsApp");

                var payload = new { phone = phoneNumber, message };
                var json = JsonSerializer.Serialize(payload, JsonOptions);
                using var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(_settings.SendEndpoint, content, cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogDebug("WhatsApp message sent to {Phone}.", phoneNumber);
                    return new WhatsAppSendResult(true);
                }

                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                var error = $"HTTP {(int)response.StatusCode}: {body}";
                _logger.LogWarning("WhatsApp API returned non-success for {Phone}: {Error}", phoneNumber, error);
                return new WhatsAppSendResult(false, error);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error calling WhatsApp API for {Phone}.", phoneNumber);
                return new WhatsAppSendResult(false, $"HttpRequestException: {ex.Message}");
            }
            catch (TaskCanceledException ex) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "WhatsApp API request timed out for {Phone}.", phoneNumber);
                return new WhatsAppSendResult(false, "Request timed out.");
            }
        }
    }
}
