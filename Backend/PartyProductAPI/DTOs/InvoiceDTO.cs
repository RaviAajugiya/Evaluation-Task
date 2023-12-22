namespace PartyProductAPI.DTOs
{
    public class InvoiceDTO
    {
        public int InvoiceId { get; set; }

        public string PartyName { get; set; }

        public string ProductName { get; set; }

        public decimal Rate { get; set; }

        public int Quantity { get; set; }

        public decimal? Total { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;
    }
}
