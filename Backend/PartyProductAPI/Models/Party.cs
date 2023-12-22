using System;
using System.Collections.Generic;

namespace PartyProductAPI.Models;

public partial class Party
{
    public int PartyId { get; set; }

    public string PartyName { get; set; } = null!;

    public virtual ICollection<AssignParty> AssignParties { get; set; } = new List<AssignParty>();

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}
