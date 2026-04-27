using AutoMapper;
using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Templates.Commands
{
    public class CreateTemplateCommandHandler : IRequestHandler<CreateTemplateCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CreateTemplateCommandHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(CreateTemplateCommand request, CancellationToken cancellationToken)
        {
            var template = _mapper.Map<Template>(request);
            template.TemplateId = Guid.NewGuid();
            template.CreatedAt = DateTime.UtcNow;

            _context.Templates.Add(template);
            await _context.SaveChangesAsync(cancellationToken);

            return template.TemplateId;
        }
    }
}
