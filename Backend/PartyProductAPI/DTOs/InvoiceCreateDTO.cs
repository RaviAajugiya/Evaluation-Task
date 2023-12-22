namespace PartyProductAPI.DTOs
{
    public class InvoiceCreateDTO
    {
        public int PartyId { get; set; }

        public int ProductId { get; set; }

        public decimal Rate { get; set; }

        public int Quantity { get; set; }

        public decimal? Total { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;
    }
}
