namespace InadControl.Api.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        
        // A senha será guardada de forma criptografada (Hash)
        public string SenhaHash { get; set; } = string.Empty;
        
        // Define o nível de acesso. Ex: "Admin" ou "Financeiro"
        public string Regra { get; set; } = "Financeiro"; 
    }
}