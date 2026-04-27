using AutoMapper;
using Domain.Entities;
using Application.DTOs;
using Application.Features.Clients.Commands;
using Application.Features.Templates.Commands;
using Application.Features.Groups.Commands;
using Application.Features.GroupMembers.Commands;
using Application.Features.Messages.Commands;





namespace Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Client, ClientDto>().ReverseMap();
            CreateMap<Client, PartnerClientDto>()
                .ForMember(dest => dest.PartnerId, opt => opt.MapFrom(src => src.PartnerId ?? Guid.Empty));
            CreateMap<CreateClientCommand, Client>();

            CreateMap<Partner, PartnerDto>()
                .ForMember(dest => dest.PartnerId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.User.Name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email ?? string.Empty))
                .ForMember(dest => dest.MobileNumber, opt => opt.MapFrom(src => src.User.MobileNumber))
                .ForMember(dest => dest.ClientCount, opt => opt.Ignore());

            CreateMap<Template, TemplateDto>().ReverseMap();
            CreateMap<CreateTemplateCommand, Template>();

            CreateMap<Group, GroupDto>().ReverseMap();
            CreateMap<CreateGroupCommand, Group>();

            CreateMap<GroupMember, GroupMemberDto>().ReverseMap();
            CreateMap<CreateGroupMemberCommand, GroupMember>();

            CreateMap<Message, MessageDto>().ReverseMap();
            CreateMap<CreateMessageCommand, Message>();
        }
    }
}
