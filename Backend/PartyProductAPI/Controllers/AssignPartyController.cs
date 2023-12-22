using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design.Internal;
using PartyProductAPI.DTOs;
using PartyProductAPI.Models;

namespace PartyProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssignPartyController : ControllerBase
    {
        private readonly PartyProductApiContext contex;
        private readonly IMapper mapper;

        public AssignPartyController(PartyProductApiContext contex, IMapper mapper)
        {
            this.contex = contex;
            this.mapper = mapper;

            this.mapper = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<AssignParty, AssignPartyDTO>()
                    .ForMember(dest => dest.PartyName, opt => opt.MapFrom(src => src.Party.PartyName))
                    .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.ProductName));
                cfg.CreateMap<AssignPartyCreateDTO, AssignParty>();
            }).CreateMapper();
        }

        [HttpGet]
        public async Task<ActionResult<List<AssignPartyDTO>>> Get()
        {
            var assignParties = await contex.AssignParties.Include(x => x.Party).Include(x => x.Product).ToListAsync();
            var assignPartyDTOs = mapper.Map<List<AssignPartyDTO>>(assignParties);
            return assignPartyDTOs;
        }

        [HttpGet("{Id}", Name = "GetAssignParty")]
        public async Task<ActionResult<AssignPartyDTO>> Get(int Id)
        {
            var assignParty = await contex.AssignParties.FirstOrDefaultAsync(x => x.AssignId == Id);
            var assinPartyDTO = mapper.Map<AssignPartyDTO>(assignParty);
            if (assignParty == null)
            {
                return NotFound();
            }
            return assinPartyDTO;
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] AssignPartyCreateDTO assignPartyCreate)
        {
            var assignParty = mapper.Map<AssignParty>(assignPartyCreate);
            contex.Add(assignParty);
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
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }

        }

        [HttpPut("{Id}")]
        public async Task<ActionResult> Put(int Id, [FromBody] AssignPartyCreateDTO assignPartyCreate)
        {
            var assignParty = mapper.Map<AssignParty>(assignPartyCreate);
            assignParty.AssignId = Id;
            contex.Entry(assignParty).State = EntityState.Modified;
            await contex.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{Id}")]
        public async Task<ActionResult> Delete(int Id)
        {
            var exists = await contex.AssignParties.AnyAsync(x => x.AssignId == Id);
            if (!exists)
            {
                return NotFound();
            }

            contex.Remove(new AssignParty { AssignId = Id });
            await contex.SaveChangesAsync();

            return NoContent();
        }

    }
}



