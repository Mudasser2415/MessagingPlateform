using Application.Common.Interfaces;
using Application.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Messages.Queries
{
    public class GetSavedMessageTemplatesQueryHandler : IRequestHandler<GetSavedMessageTemplatesQuery, List<SavedMessageTemplateDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetSavedMessageTemplatesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SavedMessageTemplateDto>> Handle(GetSavedMessageTemplatesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.SavedMessages
                .AsNoTracking()
                .AsQueryable();

            if (request.ClientId.HasValue)
            {
                query = query.Where(x => x.ClientId == request.ClientId.Value);
            }

            return await query
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new
                {
                    x.TemplateId,
                    TemplateName = x.Template != null ? x.Template.TemplateName : string.Empty
                })
                .Where(x => !string.IsNullOrWhiteSpace(x.TemplateName))
                .GroupBy(x => x.TemplateId)
                .Select(g => g.First())
                .OrderBy(x => x.TemplateName)
                .Select(x => new SavedMessageTemplateDto
                {
                    TemplateId = x.TemplateId,
                    TemplateName = x.TemplateName,
                })
                .ToListAsync(cancellationToken);
        }
    }
}