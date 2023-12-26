using AutoMapper.Internal;
using PartyProductAPI.Helper;

namespace PartyProductAPI.Service
{
    public interface IEmailService
    {
        Task SendEmailAsync(Mailrequest mailrequest);
    }
}
