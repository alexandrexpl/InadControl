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

        // 1. ROTA DE REGISTO (Para criar o nosso Admin)
        [HttpPost("register")]
        public async Task<ActionResult<Usuario>> Register(RegistroDto request)
        {
            // Verifica se o email já existe
            if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Este email já está em uso.");
            }

            // CRIPTOGRAFAR A SENHA (Ninguém vai saber qual é a senha, nem nós programadores)
            string senhaCriptografada = BCrypt.Net.BCrypt.HashPassword(request.Senha);

            var novoUsuario = new Usuario
            {
                Nome = request.Nome,
                Email = request.Email,
                SenhaHash = senhaCriptografada,
                Regra = request.Regra // Pode ser "Admin" ou "Financeiro"
            };

            _context.Usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            return Ok("Utilizador registado com sucesso!");
        }

        // 2. ROTA DE LOGIN (Para entrar no sistema)
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginDto request)
        {
            // Procura o utilizador pelo Email
            var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return BadRequest("Email ou senha incorretos.");
            }

            // Verifica se a senha que ele digitou bate com a criptografia do banco
            bool senhaCorreta = BCrypt.Net.BCrypt.Verify(request.Senha, user.SenhaHash);
            if (!senhaCorreta)
            {
                return BadRequest("Email ou senha incorretos.");
            }

            // Se chegou aqui, está tudo certo! Vamos criar a "Pulseira VIP" (Token JWT)
            string token = CriarToken(user);

            // Devolvemos o token e algumas informações básicas para o React usar
            return Ok(new { 
                token = token, 
                nome = user.Nome, 
                regra = user.Regra 
            });
        }

        // --- FUNÇÃO PRIVADA MÁGICA: A FÁBRICA DE TOKENS ---
        private string CriarToken(Usuario user)
        {
            // 1. O que vamos escrever na pulseira?
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Nome),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Regra)
            };

            // 2. A chave secreta que definimos no Program.cs
            var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("InadControlSuperSecretaChaveJWT2026!!"));
            var creds = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256Signature);

            // 3. Montar o Token (Válido por 1 dia)
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
        public string Regra { get; set; } = "Financeiro"; // Default
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }
}