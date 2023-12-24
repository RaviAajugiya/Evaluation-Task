namespace PartyProductAPI.DTOs
{
    public class InvoiceDTO
    {
        public int Id { get; set; }

        public int PartyId { get; set; }

        public string PartyName { get; set; }

        //public int ProductId { get; set; }

        //public string ProductName { get; set; }

        //public int Quantity { get; set; }

        //public decimal Rate { get; set; }


        public DateTime Date { get; set; }
    }
}
