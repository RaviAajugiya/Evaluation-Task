using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PartyProductAPI.DTOs;

namespace PartyProductAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        private readonly PartyProductApiContext contex;
        private readonly IMapper mapper;

        public InvoiceController(PartyProductApiContext contex, IMapper mapper)
        {
            this.contex = contex;
            this.mapper = mapper;

            this.mapper = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<Invoice, InvoiceDTO>()
                    .ForMember(dest => dest.PartyId, opt => opt.MapFrom(src => src.PartyId)) // Map PartyId directly
                    .ForMember(dest => dest.PartyName, opt => opt.MapFrom(src => src.Party.PartyName)); // Map PartyName

            }).CreateMapper();
        }

        [HttpGet]
        public async Task<ActionResult<List<InvoiceDTO>>> Get()
        {
            var invoiceQuery = from invoice in contex.Invoices
                               join party in contex.Parties on invoice.PartyId equals party.PartyId
                               join invoiceItem in contex.InvoiceItems on invoice.Id equals invoiceItem.InvoiceId
                               group new { invoice, invoiceItem } by new
                               {
                                   invoice.Id,
                                   party.PartyName,
                                   party.PartyId,
                                   invoice.Date
                               } into totalBill
                               select new InvoiceDTO
                               {
                                   Id = totalBill.Key.Id,
                                   PartyId = totalBill.Key.PartyId,
                                   PartyName = totalBill.Key.PartyName,
                                   Date = totalBill.Key.Date.ToString("dd-MM-yyyy hh:mm:ss tt"),
                                   Total = totalBill.Sum(item => item.invoiceItem.Rate * item.invoiceItem.Quantity)
                               };


            var invoiceDTOs = await invoiceQuery.ToListAsync();
            return invoiceDTOs;
        }



        [HttpGet("{Id}")]
        public async Task<ActionResult<InvoiceDetailsDTO>> Get(int Id)
        {
            var invoiceQuery = from invoice in contex.Invoices
                               join party in contex.Parties on invoice.PartyId equals party.PartyId
                               join invoiceIteam in contex.InvoiceItems on invoice.Id equals invoiceIteam.InvoiceId
                               join product in contex.Products on invoiceIteam.ProductId equals product.ProductId
                               where invoiceIteam.InvoiceId == Id
                               group new { invoice, party, product, invoiceIteam } by invoice.Id into g
                               select new InvoiceDetailsDTO
                               {
                                   Id = g.Key,
                                   PartyId = g.First().invoice.PartyId,
                                   PartyName = g.First().party.PartyName,
                                   Date = g.First().invoice.Date.ToString("dd-MM-yyyy hh:mm:ss tt"),
                                   Products = g.Select(item => new InvoiceProductsDTO
                                   {
                                       ProductId = item.product.ProductId,
                                       ProductName = item.product.ProductName,
                                       Quantity = item.invoiceIteam.Quantity,
                                       Rate = item.invoiceIteam.Rate,
                                       Total = item.invoiceIteam.Quantity * item.invoiceIteam.Rate
                                   }).ToList()
                               };

            var invoiceDTO = await invoiceQuery.FirstOrDefaultAsync();
            return invoiceDTO;
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] InvoiceCreateDTO invoiceCreate)
        {
            var invoice = new Invoice
            {
                PartyId = invoiceCreate.PartyId,
                Date = DateTime.Now
            };
            contex.Invoices.Add(invoice);
            await contex.SaveChangesAsync();

            foreach (var item in invoiceCreate.Products)
            {
                var invoiceIteam = new InvoiceItem
                {
                    InvoiceId = invoice.Id,
                    ProductId = item.ProductId,
                    Rate = item.Rate,
                    Quantity = item.Quantity
                };
                contex.InvoiceItems.Add(invoiceIteam);
            }
            await contex.SaveChangesAsync();

            return Ok(invoice.Id);

        }

        [HttpDelete("{Id}")]
        public async Task<ActionResult> Delete(int Id)
        {
            var invoice = await contex.Invoices.FindAsync(Id);

            if (invoice == null)
            {
                return NotFound();
            }

            var invoiceItems = contex.InvoiceItems.Where(item => item.InvoiceId == Id);
            contex.InvoiceItems.RemoveRange(invoiceItems);
            contex.Invoices.Remove(invoice);
            await contex.SaveChangesAsync();
            return NoContent();
        }


        [HttpGet("FilterInvoice")]
        public async Task<ActionResult> FilterInvoice(string partyId = null, string productId = null, string invoiceNo = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var partyIdParam = new SqlParameter("@partyId", (object)partyId ?? DBNull.Value);
            var productIdParam = new SqlParameter("@productId", productId ?? (object)DBNull.Value);
            var invoiceNoParam = new SqlParameter("@InvoiceNo", invoiceNo ?? (object)DBNull.Value);
            var startDateParam = new SqlParameter("@StartDate", startDate ?? (object)DBNull.Value);
            var endDateParam = new SqlParameter("@EndDate", endDate ?? (object)DBNull.Value);

            var invoiceHistory = await contex.Invoices
                .FromSqlRaw("EXEC FilterInvoice @PartyId, @ProductID, @InvoiceNo, @StartDate, @EndDate",
                    partyIdParam, productIdParam, invoiceNoParam, startDateParam, endDateParam)
                .ToListAsync();

            var mappedInvoices = invoiceHistory.Select(i => new InvoiceDTO
            {
                Id = i.Id,
                PartyId = i.PartyId,
                Date = i.Date.ToString("dd-MM-yyyy hh:mm:ss tt"),
                PartyName = GetPartyName(i.PartyId),
                Total = GetTotal(i.Id)
            }).ToList();

            return Ok(mappedInvoices);
        }

        private decimal GetTotal(int id)
        {
            var total = contex.Invoices
         .Where(i => i.Id == id)
         .Select(i => i.InvoiceItems.Sum(ii => ii.Quantity * ii.Rate))
         .FirstOrDefault();

            return total;
        }

        private string GetPartyName(int partyId)
        {
            var party = contex.Parties.FirstOrDefault(p => p.PartyId == partyId);
            return party?.PartyName ?? "Unknown";
        }


        [HttpGet("InvoiceProducts/{Id}")]
        public async Task<ActionResult<List<ProductDTO>>> GetProductsForDropdown(int Id)
        {
            var productsForParty = await (from product in contex.Products
                                          join productRate in contex.ProductRates on product.ProductId equals productRate.ProductId
                                          join assignParty in contex.AssignParties on product.ProductId equals assignParty.ProductId
                                          where assignParty.PartyId == Id
                                          select new
                                          {
                                              product.ProductId,
                                              product.ProductName
                                          })
                                         .Distinct()
                                         .ToListAsync();

            var productDTOs = productsForParty
                .Select(p => new ProductDTO
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName
                })
                .ToList();

            return productDTOs;
        }

        [HttpGet("InvoiceProductRate/{Id}")]
        public async Task<ActionResult<decimal>> GetInvoiceProductRate(int Id)
        {
            var latestRate = await contex.ProductRates
                .Where(pr => pr.ProductId == Id)
                .OrderByDescending(pr => pr.RateDate)
                .Select(pr => pr.Rate)
                .FirstAsync();

            return latestRate;
        }

    }
}
