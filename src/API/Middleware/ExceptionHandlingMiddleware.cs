using FluentValidation;

namespace API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception exception)
            {
                await HandleExceptionAsync(context, exception);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var traceId = context.TraceIdentifier;
            var correlationId = context.Items.TryGetValue(CorrelationIdMiddleware.ItemKey, out var currentCorrelationId)
                ? currentCorrelationId?.ToString() ?? traceId
                : traceId;
            var userId = context.User.FindFirst("userId")?.Value;

            var result = exception switch
            {
                ValidationException validationException =>
                    (
                        StatusCodes.Status400BadRequest,
                        (object)new
                        {
                            message = "Validation failed",
                            traceId,
                            correlationId,
                            errors = validationException.Errors
                                .GroupBy(error => error.PropertyName)
                                .ToDictionary(
                                    group => group.Key,
                                    group => group.Select(error => error.ErrorMessage).Distinct().ToArray())
                        }
                    ),
                KeyNotFoundException =>
                    (
                        StatusCodes.Status404NotFound,
                        (object)new
                        {
                            message = exception.Message,
                            traceId,
                            correlationId
                        }
                    ),
                UnauthorizedAccessException =>
                    (
                        StatusCodes.Status401Unauthorized,
                        (object)new
                        {
                            message = "Unauthorized",
                            traceId,
                            correlationId
                        }
                    ),
                InvalidOperationException =>
                    (
                        StatusCodes.Status400BadRequest,
                        (object)new
                        {
                            message = exception.Message,
                            traceId,
                            correlationId
                        }
                    ),
                _ =>
                    (
                        StatusCodes.Status500InternalServerError,
                        (object)new
                        {
                            message = "An unexpected error occurred.",
                            traceId,
                            correlationId
                        }
                    )
            };

            var statusCode = result.Item1;
            var response = result.Item2;

            if (statusCode >= StatusCodes.Status500InternalServerError)
            {
                _logger.LogError(
                    exception,
                    "Unhandled exception for {RequestMethod} {RequestPath}. TraceId: {TraceId}, CorrelationId: {CorrelationId}, UserId: {UserId}",
                    context.Request.Method,
                    context.Request.Path,
                    traceId,
                    correlationId,
                    string.IsNullOrWhiteSpace(userId) ? "anonymous" : userId);
            }
            else
            {
                _logger.LogWarning(
                    exception,
                    "Handled exception for {RequestMethod} {RequestPath}. TraceId: {TraceId}, CorrelationId: {CorrelationId}, UserId: {UserId}",
                    context.Request.Method,
                    context.Request.Path,
                    traceId,
                    correlationId,
                    string.IsNullOrWhiteSpace(userId) ? "anonymous" : userId);
            }

            context.Response.ContentType = "application/json";
            context.Response.Headers[CorrelationIdMiddleware.HeaderName] = correlationId;
            context.Response.StatusCode = statusCode;
            await context.Response.WriteAsJsonAsync(response);
        }
    }
}