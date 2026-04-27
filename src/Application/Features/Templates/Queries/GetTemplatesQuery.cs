using Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace Application.Features.Templates.Queries
{
    public class GetTemplatesQuery : IRequest<List<TemplateDto>>
    {
    }
}
