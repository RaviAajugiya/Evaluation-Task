
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
    public class ProductRateController : ControllerBase
    {
        private readonly PartyProductApiContext contex;
        private readonly IMapper mapper;

        public ProductRateController(PartyProductApiContext contex, IMapper mapper)
        {
            this.contex = contex;
            this.mapper = mapper;


            this.mapper = new MapperConfiguration(x =>
            {
                x.CreateMap<ProductRate, ProductRateDTO>()
                    .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.ProductName))
                    .ForMember(dest => dest.RateDate, opt => opt.MapFrom(src => src.RateDate.ToString("dd-MM-yyyy hh:mm:ss tt")));
                x.CreateMap<ProductRateCreateDTO, ProductRate>();
            }).CreateMapper();
        }

        [HttpGet]
        public async Task<ActionResult<List<ProductRateDTO>>> Get()
        {
            var productRate = await contex.ProductRates.Include(x => x.Product).ToListAsync();
            var productRateDTO = mapper.Map<List<ProductRateDTO>>(productRate);
            return productRateDTO;
        }

        [HttpGet("{Id}", Name = "GetProductRate")]
        public async Task<ActionResult<ProductRateDTO>> Get(int Id)
        {
            var productRate = await contex.ProductRates.Include(x => x.Product).FirstOrDefaultAsync(x => x.RateId == Id);
            var productRateDTO = mapper.Map<ProductRateDTO>(productRate);
            if (productRate == null)
            {
                return NotFound();
            }
            return productRateDTO;


        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ProductRateCreateDTO productCreate)
        {
            var productRate = mapper.Map<ProductRate>(productCreate);
            contex.ProductRates.Add(productRate);
            try
            {
                await contex.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                var sqlException = ex.GetBaseException() as SqlException;
                if (sqlException != null && sqlException.Number == 2627)
                {
                    return BadRequest("Party already exists.");
                }
                return StatusCode(500, "Internal Server Error: " + ex);
            }
        }

        [HttpPut("{Id}")]
        public async Task<ActionResult> Put(int Id, [FromBody] ProductRateCreateDTO productCreate)
        {
            var productRate = mapper.Map<ProductRate>(productCreate);
            productRate.RateId = Id;
            contex.Entry(productRate).State = EntityState.Modified;
            await contex.SaveChangesAsync();

            return NoContent();
        }


        [HttpDelete("{Id}")]
        public async Task<ActionResult> Delete(int Id)
        {
            var exists = await contex.ProductRates.AnyAsync(x => x.RateId == Id);
            if (!exists)
            {
                return NotFound();
            }

            contex.Remove(new ProductRate { RateId = Id });
            await contex.SaveChangesAsync();

            return NoContent();
        }
    }
}
