using Application.Common.Interfaces;
using Application.Common.Utilities;
using Application.DTOs;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace Application.Features.Clients.Queries
{
    public class LoginClientQueryHandler : IRequestHandler<LoginClientQuery, ClientDto>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public LoginClientQueryHandler(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ClientDto> Handle(LoginClientQuery request, CancellationToken cancellationToken)
        {
            var mobileNumber = MobileNumberHelper.Normalize(request.MobileNumber);

            var client = await _context.Clients
                .FirstOrDefaultAsync(x => x.MobileNumber == mobileNumber && x.Password == request.Password, cancellationToken);

            if (client == null)
            {
                throw new Exception("Invalid mobile number or password.");
            }

            return _mapper.Map<ClientDto>(client);
        }
    }
}
