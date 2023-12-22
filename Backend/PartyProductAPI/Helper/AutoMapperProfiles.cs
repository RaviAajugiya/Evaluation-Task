using AutoMapper;
using PartyProductAPI.DTOs;

namespace PartyProductAPI.Helper
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<Party, PartyDto>();
            CreateMap<Party, PartyCreateDTO>().ReverseMap();

            CreateMap<Product, ProductDTO>();
            CreateMap<Product, ProductCreateDTO>().ReverseMap();

            CreateMap<AssignParty, AssignPartyDTO>();
            CreateMap<AssignParty, AssignPartyCreateDTO>().ReverseMap();

            CreateMap<ProductRate, ProductRateDTO>();
            CreateMap<ProductRate, ProductRateCreateDTO>().ReverseMap();

            CreateMap<Invoice, InvoiceDTO>();
            CreateMap<Invoice, InvoiceCreateDTO>();
        }
    }
}
