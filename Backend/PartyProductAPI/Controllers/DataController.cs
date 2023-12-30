using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Dynamic.Core;
using Microsoft.EntityFrameworkCore;
using PartyProductAPI.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Diagnostics.Metrics;

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
        public async Task<ActionResult<List<PartyDto>>> Get()
        {

            var parties = await context.Parties.ToListAsync();
            var partyDTOs = mapper.Map<List<PartyDto>>(parties);
            return partyDTOs;
        }
        //public async Task<ActionResult<List<PartyDto>>> Get(
        //    [FromQuery] int page = 1,
        //    [FromQuery] int pageSize = 10,
        //    [FromQuery] string sortBy = "Id",
        //    [FromQuery] string sortOrder = "asc")
        //{
        //    try
        //    {
        //        // Ensure page and pageSize are valid
        //        page = Math.Max(1, page);
        //        pageSize = Math.Max(1, pageSize);

        //        var query = context.Parties.AsQueryable();

        //        // Sorting
        //        if (!string.IsNullOrEmpty(sortBy))
        //        {
        //            // Validate that the property name is valid
        //            var propertyInfo = typeof(Party).GetProperty(sortBy, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
        //            if (propertyInfo != null)
        //            {
        //                query = query.OrderBy($"{sortBy} {sortOrder}");
        //            }
        //            else
        //            {
        //                // Handle invalid property name
        //                return BadRequest("Invalid property name for sorting.");
        //            }
        //        }

        //        // Pagination
        //        var parties = await query
        //            .Skip((page - 1) * pageSize)
        //            .Take(pageSize)
        //            .ToListAsync();

        //        var partyDTOs = mapper.Map<List<PartyDto>>(parties);
        //        return partyDTOs;
        //    }
        //    catch (Exception ex)
        //    {
        //        // Handle exceptions appropriately (log, return error response, etc.)
        //        return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        //    }
        //}

    }
}
