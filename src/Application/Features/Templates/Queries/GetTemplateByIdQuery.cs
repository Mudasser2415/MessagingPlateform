using Application.DTOs;
using Application.Common.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Templates.Queries
{
    public class GetTemplateByIdQuery : IRequest<TemplateDto>
    {
        public Guid Id { get; set; }
    }

    public class GetTemplateByIdQueryHandler : IRequestHandler<GetTemplateByIdQuery, TemplateDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GetTemplateByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<TemplateDto> Handle(GetTemplateByIdQuery request, CancellationToken cancellationToken)
        {
            var template = await _context.Templates
                .FirstOrDefaultAsync(t => t.TemplateId == request.Id, cancellationToken);

            if (template == null)
            {
                throw new Exception("Template not found");
            }

            return _mapper.Map<TemplateDto>(template);
        }
    }
}
