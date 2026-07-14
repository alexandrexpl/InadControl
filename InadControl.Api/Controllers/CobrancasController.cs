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

        // GET: api/Cobrancas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCobrancas()
        {
            var cobrancas = await _context.Cobrancas
                .Include(c => c.Cliente)
                .Select(c => new {
                    id = c.Id,
                    clienteId = c.ClienteId,
                    clienteNome = c.Cliente != null ? c.Cliente.Nome : "Cliente Excluído",
                    tipoDocumento = c.TipoDocumento,
                    numeroDocumento = c.NumeroDocumento,
                    valor = c.Valor,
                    dataVencimento = c.DataVencimento,
                    status = c.Status,
                    observacao = c.Observacao
                })
                .OrderByDescending(c => c.dataVencimento)
                .ToListAsync();

            return Ok(cobrancas);
        }

        // POST: api/Cobrancas
        [HttpPost]
        public async Task<ActionResult<Cobranca>> PostCobranca(Cobranca cobranca)
        {
            var cliente = await _context.Clientes.FindAsync(cobranca.ClienteId);
            
            if (cliente == null)
            {
                return BadRequest("Cliente não encontrado. A cobrança precisa estar vinculada a um Cliente válido.");
            }

            _context.Cobrancas.Add(cobranca);
            await _context.SaveChangesAsync(); // Salva a fatura primeiro para poder contar corretamente

            // === REGRA DE NEGÓCIO: ATUALIZA O RISCO DO CLIENTE ===
            await AtualizarRiscoCliente(cliente.Id);

            return StatusCode(201, cobranca);
        }

        // PUT: api/Cobrancas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCobranca(int id, Cobranca cobranca)
        {
            if (id != cobranca.Id) return BadRequest("O ID da cobrança não confere.");

            var cobrancaExistente = await _context.Cobrancas.FindAsync(id);
            if (cobrancaExistente == null) return NotFound();

            var clienteAntigoId = cobrancaExistente.ClienteId;

            // Atualizamos os dados no banco
            cobrancaExistente.ClienteId = cobranca.ClienteId;
            cobrancaExistente.TipoDocumento = cobranca.TipoDocumento;
            cobrancaExistente.NumeroDocumento = cobranca.NumeroDocumento;
            cobrancaExistente.Valor = cobranca.Valor;
            cobrancaExistente.DataVencimento = cobranca.DataVencimento;
            cobrancaExistente.Status = cobranca.Status;
            cobrancaExistente.Observacao = cobranca.Observacao;

            await _context.SaveChangesAsync();

            // Atualiza o risco do cliente (se a cobrança mudou de dono, atualiza os dois)
            await AtualizarRiscoCliente(cobrancaExistente.ClienteId);
            if (clienteAntigoId != cobrancaExistente.ClienteId)
            {
                await AtualizarRiscoCliente(clienteAntigoId);
            }

            return NoContent();
        }

        // DELETE: api/Cobrancas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCobranca(int id)
        {
            var cobranca = await _context.Cobrancas.FindAsync(id);
            if (cobranca == null)
            {
                return NotFound();
            }

            var clienteId = cobranca.ClienteId; // Guarda o ID antes de apagar a fatura

            _context.Cobrancas.Remove(cobranca);
            await _context.SaveChangesAsync();

            // === REGRA DE NEGÓCIO: ATUALIZA O RISCO DO CLIENTE ===
            await AtualizarRiscoCliente(clienteId);

            return NoContent();
        }

        // FUNÇÃO PRIVADA: Calcula e salva o risco do cliente
        private async Task AtualizarRiscoCliente(int clienteId)
        {
            var cliente = await _context.Clientes.FindAsync(clienteId);
            if (cliente == null) return;

            // Conta quantas faturas "Atrasadas" este cliente tem no banco
            var quantidadeAtrasadas = await _context.Cobrancas
                .CountAsync(c => c.ClienteId == clienteId && c.Status == "Atrasada");

            // Aplica a regra de negócio
            if (quantidadeAtrasadas == 0)
            {
                cliente.ClassificacaoRisco = "Baixo";
            }
            else if (quantidadeAtrasadas == 1)
            {
                cliente.ClassificacaoRisco = "Médio";
            }
            else // 2 ou mais faturas atrasadas
            {
                cliente.ClassificacaoRisco = "Alto";
            }

            // Atualiza o cliente no banco
            _context.Clientes.Update(cliente);
            await _context.SaveChangesAsync();
        }
    }
}