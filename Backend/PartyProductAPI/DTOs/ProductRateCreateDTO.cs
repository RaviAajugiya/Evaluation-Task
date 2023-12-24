namespace PartyProductAPI.DTOs
{
    public class ProductRateCreateDTO
    {

        public int ProductId { get; set; }


        public decimal Rate { get; set; }

        public DateTime RateDate { get; set; } = DateTime.Now;
    }
}
