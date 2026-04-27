using Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace Application.Features.Messages.Queries
{
    public class GetMessagesQuery : IRequest<List<MessageDto>>
    {
    }
}
