using System.Collections.Generic;

namespace InadControl.Api.Models
{
    public class Cliente
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Documento { get; set; } = string.Empty; //CPF ou CNPJ
        public string Email { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public string ClassificacaoRisco { get; set; } = "Baixo"; // Ex: Baixo, Médio, Alto
        
        // Relacionamento: 1 Cliente tem N Cobranças
        public List<Cobranca> Cobrancas { get; set; } = new();
    }
}