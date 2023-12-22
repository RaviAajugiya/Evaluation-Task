using System;
using System.Collections.Generic;

namespace PartyProductAPI.Models;

public partial class ProductRate
{
    public int RateId { get; set; }

    public int ProductId { get; set; }

    public decimal Rate { get; set; }

    public DateOnly RateDate { get; set; }

    public virtual Product Product { get; set; } = null!;
}
