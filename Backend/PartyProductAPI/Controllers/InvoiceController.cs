using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PartyProductAPI.DTOs;
using PartyProductAPI.Models;

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
                    .ForMember(dest => dest.PartyName, opt => opt.MapFrom(src => src.Party.PartyName))
                    .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.ProductName));
                cfg.CreateMap<InvoiceCreateDTO, Invoice>();
            }).CreateMapper();
        }

        [HttpGet]
        public IActionResult GetInvoices(int? productId = null, DateTime? date = null, int? partyId = null)
        {
            try
            {
                var invoicesQuery = contex.Invoices
                    .FromSqlRaw("EXEC GetInvoices @productId, @Date, @partyId",
                        new SqlParameter("@productId", (object)productId ?? DBNull.Value),
                        new SqlParameter("@Date", (object)date ?? DBNull.Value),
                        new SqlParameter("@partyId", (object)partyId ?? DBNull.Value))
                    .AsEnumerable()
                    .Select(x =>
                    {
                        contex.Entry(x).Reference(i => i.Party).Load();
                        contex.Entry(x).Reference(i => i.Product).Load();
                        return x;
                    })
                    .ToList();

                var invoiceDTO = mapper.Map<List<InvoiceDTO>>(invoicesQuery);

                return Ok(invoiceDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }





        [HttpPost]
        public async Task<ActionResult> Post([FromBody] InvoiceCreateDTO invoiceCreate)
        {
            var invoice = mapper.Map<Invoice>(invoiceCreate);
            contex.Add(invoice);
            try
            {
                await contex.SaveChangesAsync();
                var invoiceDTO = mapper.Map<InvoiceDTO>(invoice);
                return NoContent();
            }
            catch (Exception ex)
            {
                var sqlException = ex.GetBaseException() as SqlException;
                if (sqlException != null && sqlException.Number == 2627)
                {
                    return BadRequest("Party already exists.");
                }
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [HttpDelete("{Id}")]
        public async Task<ActionResult> Delete(int Id)
        {
            var exists = await contex.Invoices.AnyAsync(x => x.PartyId == Id);
            if (!exists)
            {
                return NotFound();
            }
            contex.Remove(new Invoice { InvoiceId = Id });
            await contex.SaveChangesAsync();
            return NoContent();
        }

    }
}
