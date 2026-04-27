using Application.Common.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Templates.Commands
{
    public class UpdateTemplateCommandHandler : IRequestHandler<UpdateTemplateCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateTemplateCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateTemplateCommand request, CancellationToken cancellationToken)
        {
            var template = await _context.Templates
                .FirstOrDefaultAsync(t => t.TemplateId == request.TemplateId, cancellationToken);

            if (template == null)
            {
                throw new Exception("Template not found");
            }

            template.TemplateName = request.TemplateName;
            template.TemplateContent = request.TemplateContent;
            template.Category = request.Category;
            template.TemplateType = request.TemplateType;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
