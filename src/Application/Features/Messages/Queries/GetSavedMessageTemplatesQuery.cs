using Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;

namespace Application.Features.Messages.Queries
{
    public class GetSavedMessageTemplatesQuery : IRequest<List<SavedMessageTemplateDto>>
    {
        public Guid? ClientId { get; set; }
    }
}