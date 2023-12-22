using System.ComponentModel.DataAnnotations;

namespace PartyProductAPI.DTOs
{
    public class ProductDTO
    {
        public decimal ProductId { get; set; }
        public string ProductName { get; set; } = null!;

    }
}
