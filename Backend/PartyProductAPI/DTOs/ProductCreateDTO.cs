using System.ComponentModel.DataAnnotations;

namespace PartyProductAPI.DTOs
{
    public class ProductCreateDTO
    {
        [Required(ErrorMessage = "ProductName is required")]
        public string ProductName { get; set; } = null!;

    }
}
