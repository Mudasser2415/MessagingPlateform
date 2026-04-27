using Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace Application.Features.Groups.Queries
{
    public class GetGroupsQuery : IRequest<List<GroupDto>>
    {
    }
}
