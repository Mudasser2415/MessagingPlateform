using Application.Common.Interfaces;
using Application.DTOs;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Infrastructure.Services
{
    /// <summary>
    /// Proxies the India Post PIN code API (api.postalpincode.in) with 24-hour in-memory caching.
    /// </summary>
    public sealed partial class AddressLookupService : IAddressLookupService
    {
        private const string BaseUrl = "https://api.postalpincode.in/pincode/";
        private const string HttpClientName = "IndiaPost";
        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);
        private static readonly TimeSpan RequestTimeout = TimeSpan.FromSeconds(8);

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
        };

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _cache;
        private readonly ILogger<AddressLookupService> _logger;

        public AddressLookupService(
            IHttpClientFactory httpClientFactory,
            IMemoryCache cache,
            ILogger<AddressLookupService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _logger = logger;
        }

        public async Task<AddressLookupResponseDto?> LookupAsync(string pinCode, CancellationToken cancellationToken = default)
        {
            // Validate format
            if (!PinCodeRegex().IsMatch(pinCode))
                return null;

            string cacheKey = $"pincode:{pinCode}";
            if (_cache.TryGetValue(cacheKey, out AddressLookupResponseDto? cached))
                return cached;

            try
            {
                var client = _httpClientFactory.CreateClient(HttpClientName);
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(RequestTimeout);

                var response = await client.GetAsync($"{BaseUrl}{pinCode}", cts.Token);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("India Post API returned {StatusCode} for PIN {PinCode}", response.StatusCode, pinCode);
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync(cts.Token);
                var root = JsonSerializer.Deserialize<List<PostalApiResponse>>(json, JsonOptions);

                var apiResponse = root?.FirstOrDefault();
                if (apiResponse is null || apiResponse.Status != "Success" || apiResponse.PostOffice is null || apiResponse.PostOffice.Count == 0)
                {
                    _logger.LogInformation("No postal data found for PIN {PinCode}", pinCode);
                    return null;
                }

                var first = apiResponse.PostOffice[0];
                var dto = new AddressLookupResponseDto
                {
                    PinCode = pinCode,
                    State = first.State ?? string.Empty,
                    District = first.District ?? string.Empty,
                    Taluk = first.Block ?? string.Empty,
                    PostOffices = apiResponse.PostOffice
                        .Select(p => p.Name ?? string.Empty)
                        .Where(n => !string.IsNullOrWhiteSpace(n))
                        .Distinct()
                        .ToList(),
                };

                _cache.Set(cacheKey, dto, CacheDuration);
                return dto;
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("India Post API request timed out or cancelled for PIN {PinCode}", pinCode);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error fetching address for PIN {PinCode}", pinCode);
                return null;
            }
        }

        [GeneratedRegex(@"^\d{6}$")]
        private static partial Regex PinCodeRegex();

        // ── Raw API response models ────────────────────────────────────────

        private sealed class PostalApiResponse
        {
            [JsonPropertyName("Status")]
            public string? Status { get; set; }

            [JsonPropertyName("PostOffice")]
            public List<PostOfficeEntry>? PostOffice { get; set; }
        }

        private sealed class PostOfficeEntry
        {
            [JsonPropertyName("Name")]
            public string? Name { get; set; }

            [JsonPropertyName("Block")]
            public string? Block { get; set; }

            [JsonPropertyName("District")]
            public string? District { get; set; }

            [JsonPropertyName("Division")]
            public string? Division { get; set; }

            [JsonPropertyName("Region")]
            public string? Region { get; set; }

            [JsonPropertyName("State")]
            public string? State { get; set; }
        }
    }
}
