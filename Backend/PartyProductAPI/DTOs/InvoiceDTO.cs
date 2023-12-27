using System;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace PartyProductAPI.DTOs
{
    public class InvoiceDTO
    {


        public int Id { get; set; }

        public int PartyId { get; set; }

        public string PartyName { get; set; }

        public DateTime Date { get; set; }


    }
}
