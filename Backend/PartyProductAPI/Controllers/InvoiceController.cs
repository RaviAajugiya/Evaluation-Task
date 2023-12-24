using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PartyProductAPI.DTOs;

namespace PartyProductAPI.Controllers
{
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
                    .ForMember(dest => dest.PartyName, opt => opt.MapFrom(src => src.Party.PartyName));

                cfg.CreateMap<AssignPartyCreateDTO, AssignParty>();
            }).CreateMapper();
        }

        [HttpGet]
        public async Task<ActionResult<List<InvoiceDTO>>> Get()
        {
            var invoiceQuery = from invoice in contex.Invoices
                               join party in contex.Parties on invoice.PartyId equals party.PartyId
                               //join invoiceIteam in contex.InvoiceItems on invoice.Id equals invoiceIteam.InvoiceId
                               //join product in contex.Products on invoiceIteam.ProductId equals product.ProductId
                               select new InvoiceDTO
                               {
                                   Id = invoice.Id,
                                   PartyId = invoice.PartyId,
                                   PartyName = party.PartyName,
                                   Date = invoice.Date,
                               };

            var invoiceDTOs = await invoiceQuery.ToListAsync();
            return invoiceDTOs;
        }


        [HttpDelete("{Id}")]
        public async Task<ActionResult> Delete(int Id)
        {
            var invoice = await contex.Invoices.FindAsync(Id);

            if (invoice == null)
            {
                return NotFound();
            }

            // Remove related 
            var invoiceItems = contex.InvoiceItems.Where(item => item.InvoiceId == Id);
            contex.InvoiceItems.RemoveRange(invoiceItems);

            contex.Invoices.Remove(invoice);

            await contex.SaveChangesAsync();

            return NoContent();
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
                                   Date = g.First().invoice.Date,
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

    }
}
