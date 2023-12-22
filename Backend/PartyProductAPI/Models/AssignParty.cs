using System;
using System.Collections.Generic;

namespace PartyProductAPI.Models;

public partial class AssignParty
{
    public int AssignId { get; set; }

    public int PartyId { get; set; }

    public int ProductId { get; set; }

    public virtual Party Party { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
