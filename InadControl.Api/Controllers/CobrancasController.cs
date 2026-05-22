using InadControl.Api.Data;
using InadControl.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InadControl.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CobrancasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CobrancasController(AppDbContext context)
        {
            _context = context;
        }

        //Listagem das cobranças
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cobranca>>> GetCobrancas()
        {
            return await _context.Cobrancas.Include(c => c.Cliente).ToListAsync();
        }

        //Registro de uma nova cobrança
        [HttpPost]
        public async Task<ActionResult<Cobranca>> PostCobranca(Cobranca cobranca)
        {
            //Impede o registro de uma cobrança se o Cliente não existir no banco
            var clienteExiste = await _context.Clientes.AnyAsync(c => c.Id == cobranca.ClienteId);
            if (!clienteExiste)
            {
                return BadRequest("Cliente não encontrado. A cobrança precisa estar vinculada a um Cliente válido.");
            }

            _context.Cobrancas.Add(cobranca);
            await _context.SaveChangesAsync();

            return StatusCode(201, cobranca);
        }
    }
}