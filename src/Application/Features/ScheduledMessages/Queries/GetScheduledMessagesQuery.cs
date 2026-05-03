using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.ScheduledMessages.Queries
{
    public class GetScheduledMessagesQuery : IRequest<List<ScheduledMessageDto>>
    {
        public Guid? ClientId { get; set; }
    }

    public class GetScheduledMessagesQueryHandler : IRequestHandler<GetScheduledMessagesQuery, List<ScheduledMessageDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetScheduledMessagesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ScheduledMessageDto>> Handle(
            GetScheduledMessagesQuery request,
            CancellationToken cancellationToken)
        {
            var query = _context.ScheduledMessages
                .AsNoTracking()
                .Include(s => s.Template)
                .Include(s => s.Group)
                .AsQueryable();

            if (request.ClientId.HasValue)
                query = query.Where(s => s.ClientId == request.ClientId.Value);

            return await query
                .OrderByDescending(s => s.ScheduledAt)
                .Select(s => new ScheduledMessageDto
                {
                    Id = s.Id,
                    ClientId = s.ClientId,
                    TemplateId = s.TemplateId,
                    TemplateName = s.Template != null ? s.Template.TemplateName : string.Empty,
                    GroupId = s.GroupId,
                    GroupName = s.Group != null ? s.Group.GroupName : null,
                    PhoneNumber = s.PhoneNumber,
                    ScheduledAt = s.ScheduledAt,
                    Status = s.Status.ToString(),
                    ErrorMessage = s.ErrorMessage,
                    CreatedAt = s.CreatedAt,
                    ProcessedAt = s.ProcessedAt,
                })
                .ToListAsync(cancellationToken);
        }
    }
}
