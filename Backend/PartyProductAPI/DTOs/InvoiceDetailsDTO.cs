namespace PartyProductAPI.DTOs
{
    public class InvoiceDetailsDTO
    {
        public int Id { get; set; }
        public int PartyId { get; set; }
        public string PartyName { get; set; }
        public DateTime Date { get; set; }
        public List<InvoiceProductsDTO> Products { get; set; }
    }

    public class InvoiceProductsDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Total { get; set; }
    }
}
