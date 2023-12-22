namespace PartyProductAPI.DTOs
{
    public class ProductRateCreateDTO
    {

        public int ProductId { get; set; }


        public decimal Rate { get; set; }

        public DateOnly RateDate { get; set; }
    }
}
