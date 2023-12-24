using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PartyProductAPI.DTOs;

namespace PartyProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartyController : ControllerBase
    {
        private readonly PartyProductApiContext contex;
        private readonly IMapper mapper;

        public PartyController(PartyProductApiContext contex, IMapper mapper)
        {
            this.contex = contex;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<PartyDto>>> Get()
        {

            var parties = await contex.Parties.ToListAsync();
            var partyDTOs = mapper.Map<List<PartyDto>>(parties);
            return partyDTOs;
        }

        [HttpGet("{Id}", Name = "GetParty")]
        public async Task<ActionResult<PartyDto>> Get(int Id)
        {
            var party = await contex.Parties.FirstOrDefaultAsync(x => x.PartyId == Id);
            var partyDTO = mapper.Map<PartyDto>(party);

            if (party == null)
            {
                return NotFound();
            }
            return partyDTO;
        }

        [HttpPost]

        public async Task<ActionResult> Post([FromBody] PartyCreateDTO partyCreate)
        {
            var party = mapper.Map<Party>(partyCreate);
            contex.Add(party);
            try
            {
                await contex.SaveChangesAsync();
                var partyDTO = mapper.Map<PartyDto>(party);
                return CreatedAtRoute("GetParty", new { Id = party.PartyId }, partyDTO);

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
        public async Task<ActionResult> Put(int Id, [FromBody] PartyCreateDTO partyCreate)
        {
            var party = mapper.Map<Party>(partyCreate);
            party.PartyId = Id;
            contex.Entry(party).State = EntityState.Modified;
            await contex.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{Id}")]
        public async Task<ActionResult> Delete(int Id)
        {
            var exists = await contex.Parties.AnyAsync(x => x.PartyId == Id);
            if (!exists)
            {
                return NotFound();
            }

            contex.Remove(new Party { PartyId = Id });
            await contex.SaveChangesAsync();

            return NoContent();
        }
    }
}
