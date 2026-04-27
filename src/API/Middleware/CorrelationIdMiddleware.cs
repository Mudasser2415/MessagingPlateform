using Serilog.Context;

namespace API.Middleware
{
    public class CorrelationIdMiddleware
    {
        public const string HeaderName = "X-Correlation-ID";
        public const string ItemKey = "CorrelationId";

        private readonly RequestDelegate _next;
        private readonly ILogger<CorrelationIdMiddleware> _logger;

        public CorrelationIdMiddleware(
            RequestDelegate next,
            ILogger<CorrelationIdMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var correlationId = ResolveCorrelationId(context);

            context.Items[ItemKey] = correlationId;
            context.Response.Headers[HeaderName] = correlationId;

            using (LogContext.PushProperty("CorrelationId", correlationId))
            {
                _logger.LogDebug(
                    "Assigned correlation ID {CorrelationId} to {RequestMethod} {RequestPath}",
                    correlationId,
                    context.Request.Method,
                    context.Request.Path);

                await _next(context);
            }
        }

        private static string ResolveCorrelationId(HttpContext context)
        {
            var incomingCorrelationId = context.Request.Headers[HeaderName].FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(incomingCorrelationId))
            {
                return incomingCorrelationId.Trim();
            }

            return Guid.NewGuid().ToString("N");
        }
    }
}