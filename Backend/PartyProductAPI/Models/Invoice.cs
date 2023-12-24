using System;
using System.Collections.Generic;

namespace PartyProductAPI.Models;

public partial class Invoice
{
    public int Id { get; set; }

    public int PartyId { get; set; }

    public DateTime Date { get; set; }

    public virtual ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();

    public virtual Party Party { get; set; } = null!;
}
