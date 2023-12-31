using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Dynamic.Core;
using Microsoft.EntityFrameworkCore;
using PartyProductAPI.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PartyProductAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataController : ControllerBase
    {
        private readonly PartyProductApiContext context;
        private readonly IMapper mapper;

        public DataController(PartyProductApiContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<PartyDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 5, [FromQuery] string sortColumn = "partyId", [FromQuery] string sortOrder = "asc")
        {
            int skip = (page - 1) * pageSize;

            var partiesQuery = context.Parties.AsQueryable();

            // Sorting using System.Linq.Dynamic.Core
            var orderByExpression = $"{sortColumn} {sortOrder}";
            partiesQuery = partiesQuery.OrderBy(orderByExpression);

            // Paging
            var parties = await partiesQuery.Skip(skip).Take(pageSize).ToListAsync();
            var partyDTOs = mapper.Map<List<PartyDto>>(parties);

            return partyDTOs;
        }
    }
}
