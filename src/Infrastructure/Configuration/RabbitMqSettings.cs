namespace Infrastructure.Configuration
{
    public class RabbitMqSettings
    {
        public string Host { get; set; } = "localhost";
        public int Port { get; set; } = 5672;
        public string Username { get; set; } = "guest";
        public string Password { get; set; } = "guest";
        public string VirtualHost { get; set; } = "/";
        public string QueueName { get; set; } = "message.send";
        public int ReconnectDelaySeconds { get; set; } = 5;
    }
}
