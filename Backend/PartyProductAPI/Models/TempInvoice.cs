using System;
using System.Collections.Generic;

namespace PartyProductAPI.Models;

public partial class TempInvoice
{
    public decimal InvoiceId { get; set; }

    public string PartyName { get; set; } = null!;

    public string ProductName { get; set; } = null!;

    public decimal Rate { get; set; }

    public decimal Quantity { get; set; }

    public decimal? Total { get; set; }
}
