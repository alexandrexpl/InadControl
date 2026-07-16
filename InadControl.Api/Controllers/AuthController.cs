using BCrypt.Net;
using InadControl.Api.Data;
using InadControl.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InadControl.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // 1. ROTA DE REGISTO (Para criar utilizadores)
        [HttpPost("register")]
        public async Task<ActionResult<Usuario>> Register(RegistroDto request)
        {
            // Limpa os espaços em branco no início e no fim
            request.Nome = request.Nome.Trim();
            request.Email = request.Email.Trim();

            if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Este email já está em uso.");
            }

            // NOVA REGRA: Impede a criação de nomes duplicados (ignorando maiúsculas/minúsculas)
            if (await _context.Usuarios.AnyAsync(u => u.Nome.ToLower() == request.Nome.ToLower()))
            {
                return BadRequest("Este nome de utilizador já está em uso.");
            }

            string senhaCriptografada = BCrypt.Net.BCrypt.HashPassword(request.Senha);

            var novoUsuario = new Usuario
            {
                Nome = request.Nome,
                Email = request.Email,
                SenhaHash = senhaCriptografada,
                Regra = request.Regra
            };

            _context.Usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            return Ok("Utilizador registado com sucesso!");
        }

        // 2. ROTA DE LOGIN (Para entrar no sistema)
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginDto request)
        {
            var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return BadRequest("Email ou senha incorretos.");

            bool senhaCorreta = BCrypt.Net.BCrypt.Verify(request.Senha, user.SenhaHash);
            if (!senhaCorreta) return BadRequest("Email ou senha incorretos.");

            string token = CriarToken(user);

            return Ok(new { token = token, nome = user.Nome, regra = user.Regra });
        }

        // 3. ROTA PARA LISTAR UTILIZADORES
        [HttpGet("usuarios")]
        public async Task<ActionResult<IEnumerable<object>>> GetUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Select(u => new { u.Id, u.Nome, u.Email, u.Regra })
                .OrderBy(u => u.Nome)
                .ToListAsync();
                
            return Ok(usuarios);
        }

        // 4. NOVA ROTA: EDITAR UTILIZADOR
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarUsuario(int id, EdicaoUsuarioDto request)
        {
            // Limpa os espaços em branco no início e no fim
            request.Nome = request.Nome.Trim();
            request.Email = request.Email.Trim();

            var user = await _context.Usuarios.FindAsync(id);
            if (user == null) return NotFound("Utilizador não encontrado.");

            // Impede que altere para um email que já pertence a outra pessoa
            if (user.Email != request.Email && await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Este email já está a ser utilizado por outra conta.");
            }

            // NOVA REGRA: Impede que mude para um nome que já pertence a outra pessoa
            if (user.Nome != request.Nome && await _context.Usuarios.AnyAsync(u => u.Nome.ToLower() == request.Nome.ToLower()))
            {
                return BadRequest("Este nome de utilizador já está a ser utilizado por outra conta.");
            }

            user.Nome = request.Nome;
            user.Email = request.Email;
            user.Regra = request.Regra;

            await _context.SaveChangesAsync();
            return Ok("Utilizador atualizado com sucesso!");
        }

        // 5. NOVA ROTA: RESETAR SENHA
        [HttpPut("{id}/reset-password")]
        public async Task<IActionResult> ResetarSenha(int id, ResetSenhaDto request)
        {
            var user = await _context.Usuarios.FindAsync(id);
            if (user == null) return NotFound("Utilizador não encontrado.");

            // Criptografa a nova senha antes de a guardar
            user.SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
            
            await _context.SaveChangesAsync();
            return Ok("Senha redefinida com sucesso!");
        }

        // 6. NOVA ROTA: EXCLUIR UTILIZADOR
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarUsuario(int id)
        {
            var user = await _context.Usuarios.FindAsync(id);
            if (user == null) return NotFound("Utilizador não encontrado.");

            _context.Usuarios.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("Utilizador removido com sucesso!");
        }

        // --- FUNÇÃO PRIVADA MÁGICA: A FÁBRICA DE TOKENS ---
        private string CriarToken(Usuario user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Nome),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Regra)
            };

            var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("InadControlSuperSecretaChaveJWT2026!!"));
            var creds = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // --- CLASSES DE APOIO (DTOs) ---
    public class RegistroDto
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string Regra { get; set; } = "Financeiro";
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }

    // NOVOS DTOs PARA EDIÇÃO
    public class EdicaoUsuarioDto
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Regra { get; set; } = string.Empty;
    }

    public class ResetSenhaDto
    {
        public string NovaSenha { get; set; } = string.Empty;
    }
}