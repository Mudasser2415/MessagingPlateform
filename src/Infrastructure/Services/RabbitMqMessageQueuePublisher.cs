using Application.Common.Interfaces;
using Infrastructure.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    /// <summary>
    /// Publishes a batch of message IDs to RabbitMQ as a single JSON payload.
    /// Creates a short-lived connection per publish; for high-throughput scenarios
    /// consider upgrading to a singleton IConnection with pooled channels.
    /// </summary>
    public sealed class RabbitMqMessageQueuePublisher : IMessageQueuePublisher
    {
        private readonly RabbitMqSettings _settings;
        private readonly ILogger<RabbitMqMessageQueuePublisher> _logger;

        public RabbitMqMessageQueuePublisher(
            IOptions<RabbitMqSettings> settings,
            ILogger<RabbitMqMessageQueuePublisher> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task PublishAsync(IReadOnlyList<Guid> messageIds, CancellationToken cancellationToken = default)
        {
            if (messageIds.Count == 0) return;

            await Task.Run(() =>
            {
                var factory = CreateFactory();
                using var connection = factory.CreateConnection();
                using var channel = connection.CreateModel();

                channel.QueueDeclare(
                    queue: _settings.QueueName,
                    durable: true,
                    exclusive: false,
                    autoDelete: false,
                    arguments: null);

                var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(messageIds));

                var props = channel.CreateBasicProperties();
                props.Persistent = true;        // survive broker restart
                props.ContentType = "application/json";
                props.MessageId = Guid.NewGuid().ToString();
                props.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

                channel.BasicPublish(
                    exchange: string.Empty,
                    routingKey: _settings.QueueName,
                    basicProperties: props,
                    body: body);

                _logger.LogInformation(
                    "Published batch of {Count} message IDs to queue '{Queue}'.",
                    messageIds.Count, _settings.QueueName);
            }, cancellationToken);
        }

        private ConnectionFactory CreateFactory() => new()
        {
            HostName = _settings.Host,
            Port = _settings.Port,
            UserName = _settings.Username,
            Password = _settings.Password,
            VirtualHost = _settings.VirtualHost,
            DispatchConsumersAsync = true,
        };
    }
}
