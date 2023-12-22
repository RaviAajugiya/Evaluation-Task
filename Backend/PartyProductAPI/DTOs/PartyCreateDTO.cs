using System.ComponentModel.DataAnnotations;

namespace PartyProductAPI.DTOs
{
    public class PartyCreateDTO
    {
        [Required(ErrorMessage = "PartyName is Required")]
        public string PartyName { get; set; } = null!;
    }
}
