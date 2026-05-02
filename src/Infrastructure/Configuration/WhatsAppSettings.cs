namespace Infrastructure.Configuration
{
    public class WhatsAppSettings
    {
        public string BaseUrl { get; set; } = "http://localhost:3000";
        public string SendEndpoint { get; set; } = "/send";
        public int TimeoutSeconds { get; set; } = 30;
    }
}
