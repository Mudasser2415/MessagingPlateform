using Application.Common.Interfaces;
using Application.Common.Services;
using Application.Features.Messages.Commands;
using Infrastructure.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Infrastructure.Workers
{
    /// <summary>
    /// Long-running background service that consumes message IDs from RabbitMQ,
    /// calls the WhatsApp service, and updates message status in the database.
    /// Automatically reconnects on connection failure.
    /// </summary>
    public sealed class MessageProcessingWorker : BackgroundService
    {
        private const int MaxAttempts = 4; // 1 initial + 3 retries

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IWhatsAppService _whatsAppService;
        private readonly RabbitMqSettings _settings;
        private readonly ILogger<MessageProcessingWorker> _logger;

        public MessageProcessingWorker(
            IServiceScopeFactory scopeFactory,
            IWhatsAppService whatsAppService,
            IOptions<RabbitMqSettings> settings,
            ILogger<MessageProcessingWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _whatsAppService = whatsAppService;
            _settings = settings.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("MessageProcessingWorker starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                IConnection? connection = null;
                IModel? channel = null;

                try
                {
                    var factory = CreateFactory();
                    connection = factory.CreateConnection("MessageProcessingWorker");
                    channel = connection.CreateModel();

                    channel.QueueDeclare(
                        queue: _settings.QueueName,
                        durable: true,
                        exclusive: false,
                        autoDelete: false,
                        arguments: null);

                    // Prefetch 10 messages at a time — prevents overwhelming in-process queue
                    channel.BasicQos(prefetchSize: 0, prefetchCount: 10, global: false);

                    var consumer = new AsyncEventingBasicConsumer(channel);
                    consumer.Received += async (_, ea) =>
                    {
                        try
                        {
                            var body = ea.Body.ToArray();
                            var messageIds = JsonSerializer.Deserialize<List<Guid>>(
                                Encoding.UTF8.GetString(body));

                            if (messageIds is null || messageIds.Count == 0)
                            {
                                _logger.LogWarning("Received empty or unparseable message batch. Discarding.");
                                channel.BasicNack(ea.DeliveryTag, multiple: false, requeue: false);
                                return;
                            }

                            await ProcessBatchAsync(messageIds, stoppingToken);
                            channel.BasicAck(ea.DeliveryTag, multiple: false);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Unhandled error processing batch (delivery tag {Tag}). Dead-lettering.",
                                ea.DeliveryTag);
                            channel.BasicNack(ea.DeliveryTag, multiple: false, requeue: false);
                        }
                    };

                    channel.BasicConsume(
                        queue: _settings.QueueName,
                        autoAck: false,
                        consumer: consumer);

                    _logger.LogInformation(
                        "MessageProcessingWorker connected to RabbitMQ at {Host}:{Port}, consuming '{Queue}'.",
                        _settings.Host, _settings.Port, _settings.QueueName);

                    // Block until connection shuts down or cancellation is requested
                    var waitTcs = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
                    connection.ConnectionShutdown += (_, args) =>
                    {
                        if (!stoppingToken.IsCancellationRequested)
                            _logger.LogWarning("RabbitMQ connection shut down: {ReplyText}. Reconnecting...", args.ReplyText);
                        waitTcs.TrySetResult();
                    };
                    using var reg = stoppingToken.Register(() => waitTcs.TrySetResult());
                    await waitTcs.Task;
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "RabbitMQ connection error. Reconnecting in {Delay}s.",
                        _settings.ReconnectDelaySeconds);
                    await Task.Delay(TimeSpan.FromSeconds(_settings.ReconnectDelaySeconds), stoppingToken);
                }
                finally
                {
                    try { channel?.Close(); } catch { /* ignore */ }
                    try { connection?.Close(); } catch { /* ignore */ }
                    channel?.Dispose();
                    connection?.Dispose();
                }
            }

            _logger.LogInformation("MessageProcessingWorker stopped.");
        }

        private async Task ProcessBatchAsync(List<Guid> messageIds, CancellationToken cancellationToken)
        {
            foreach (var messageId in messageIds)
            {
                if (cancellationToken.IsCancellationRequested) break;
                await ProcessSingleMessageAsync(messageId, cancellationToken);
            }
        }

        private async Task ProcessSingleMessageAsync(Guid messageId, CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

            var message = await context.Messages
                .FirstOrDefaultAsync(m => m.Id == messageId, cancellationToken);

            if (message is null)
            {
                _logger.LogWarning("Message {MessageId} not found in database. Skipping.", messageId);
                return;
            }

            // Idempotency guard — skip if already processed
            if (message.Status != MessageStatuses.Pending)
            {
                _logger.LogInformation(
                    "Message {MessageId} already has status '{Status}'. Skipping.",
                    messageId, message.Status);
                return;
            }

            bool sent = false;

            for (int attempt = 1; attempt <= MaxAttempts && !sent && !cancellationToken.IsCancellationRequested; attempt++)
            {
                try
                {
                    var result = await _whatsAppService.SendAsync(
                        message.PhoneNumber, message.MessageContent, cancellationToken);

                    if (result.Success)
                    {
                        message.Status = MessageStatuses.Sent;
                        message.SentAt = DateTime.UtcNow;
                        message.ErrorMessage = null;
                        sent = true;

                        _logger.LogInformation(
                            "Message {MessageId} sent to {Phone} on attempt {Attempt}.",
                            messageId, message.PhoneNumber, attempt);
                    }
                    else
                    {
                        message.RetryCount = attempt;
                        message.ErrorMessage = result.ErrorMessage;
                        LogRetry(messageId, message.PhoneNumber, attempt, result.ErrorMessage);

                        if (attempt < MaxAttempts)
                            await ExponentialDelayAsync(attempt, cancellationToken);
                    }
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    _logger.LogWarning("Message {MessageId} processing cancelled.", messageId);
                    break;
                }
                catch (Exception ex)
                {
                    message.RetryCount = attempt;
                    message.ErrorMessage = ex.Message;
                    LogRetry(messageId, message.PhoneNumber, attempt, ex.Message);

                    if (attempt < MaxAttempts)
                        await ExponentialDelayAsync(attempt, cancellationToken);
                }
            }

            if (!sent && message.Status == MessageStatuses.Pending)
            {
                message.Status = MessageStatuses.Failed;
                _logger.LogError(
                    "Message {MessageId} to {Phone} permanently failed after {MaxAttempts} attempts. Last error: {Error}",
                    messageId, message.PhoneNumber, MaxAttempts, message.ErrorMessage);
            }

            await context.SaveChangesAsync(cancellationToken);
        }

        private void LogRetry(Guid messageId, string phone, int attempt, string? error) =>
            _logger.LogWarning(
                "Message {MessageId} to {Phone}: attempt {Attempt}/{Max} failed. Error: {Error}",
                messageId, phone, attempt, MaxAttempts, error);

        private static Task ExponentialDelayAsync(int attempt, CancellationToken cancellationToken) =>
            Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt - 1)), cancellationToken);

        private ConnectionFactory CreateFactory() => new()
        {
            HostName = _settings.Host,
            Port = _settings.Port,
            UserName = _settings.Username,
            Password = _settings.Password,
            VirtualHost = _settings.VirtualHost,
            DispatchConsumersAsync = true,        // required for AsyncEventingBasicConsumer
            AutomaticRecoveryEnabled = false,     // handled manually above
        };
    }
}
