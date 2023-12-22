using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PartyProductAPI.DTOs
{
    public class AssignPartyDTO
    {
        public int AssignId { get; set; }
        public int PartyId { get; set; }
        public int ProductId { get; set; }
        public string PartyName { get; set; }
        public string ProductName { get; set; }
    }
}
