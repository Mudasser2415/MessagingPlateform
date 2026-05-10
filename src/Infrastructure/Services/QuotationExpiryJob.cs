using Application.Features.Quotations.Commands;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class QuotationExpiryJob{
    private readonly IMediator _mediator;
    private readonly ILogger<QuotationExpiryJob> _logger;

    public QuotationExpiryJob(IMediator mediator, ILogger<QuotationExpiryJob> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task RunAsync()
    {
        var expired = await _mediator.Send(new ExpireQuotationsCommand());
        _logger.LogInformation("QuotationExpiryJob: {Count} quotation(s) marked as expired", expired);
    }
}
