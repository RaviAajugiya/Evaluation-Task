namespace PartyProductAPI.DTOs
{
    public class ProductRateDTO
    {
        public int RateId { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; }

        public decimal Rate { get; set; }

        public string RateDate { get; set; }
    }
}
