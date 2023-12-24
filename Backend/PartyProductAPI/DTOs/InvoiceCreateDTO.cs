namespace PartyProductAPI.DTOs
{
    public class InvoiceCreateDTO
    {
        public int PartyId { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        public List<InvoiceItemDTO> Products { get; set; } = new List<InvoiceItemDTO>();

    }

    public class InvoiceItemDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
    }
}
