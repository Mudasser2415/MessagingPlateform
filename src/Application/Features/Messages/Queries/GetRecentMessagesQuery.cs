using Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace Application.Features.Messages.Queries
{
    public class GetRecentMessagesQuery : IRequest<List<MessageDto>>
    {
        public int Count { get; set; } = 10;
    }
}
