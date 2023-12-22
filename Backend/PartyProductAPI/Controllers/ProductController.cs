using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PartyProductAPI.DTOs;
using PartyProductAPI.Models;
using System.IO;

namespace PartyProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly PartyProductApiContext contex;
        private readonly IMapper mapper;

        public ProductController(PartyProductApiContext contex, IMapper mapper)
        {
            this.contex = contex;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProductDTO>>> Get()
        {
            var products = await contex.Products.ToListAsync();
            var productDTOs = mapper.Map<List<ProductDTO>>(products);
            return productDTOs;

        }

        [HttpGet("{Id}", Name = "GetProduct")]
        public async Task<ActionResult<ProductDTO>> Get(int Id)
        {
            var product = await contex.Products.FirstOrDefaultAsync(x => x.ProductId == Id);
            var productDTO = mapper.Map<ProductDTO>(product);
            if (product == null)
            {
                return NotFound();
            }
            return productDTO;

        }


        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ProductCreateDTO productCreate)
        {
            var product = mapper.Map<Product>(productCreate);
            contex.Add(product);
            try
            {
                await contex.SaveChangesAsync();
                var productDTO = mapper.Map<ProductDTO>(product);
                return CreatedAtRoute("GetProduct", new { Id = product.ProductId }, productDTO);

            }
            catch (Exception ex)
            {
                var sqlException = ex.GetBaseException() as SqlException;
                if (sqlException != null && sqlException.Number == 2601)
                {
                    return BadRequest("Product already exists.");
                }
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [HttpPut("{Id}")]

        public async Task<ActionResult> Put(int Id, [FromBody] ProductCreateDTO productCreate)
        {
            var product = mapper.Map<Product>(productCreate);
            product.ProductId = Id;
            contex.Entry(product).State = EntityState.Modified;
            await contex.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{Id}")]
        public async Task<ActionResult> Delete(int Id)
        {
            var exists = await contex.Products.AnyAsync(x => x.ProductId == Id);
            if (!exists)
            {
                return NotFound();
            }
            contex.Remove(new Product { ProductId = Id });
            await contex.SaveChangesAsync();

            return NoContent();
        }
    }
}
