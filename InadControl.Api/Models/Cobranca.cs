using System;

namespace InadControl.Api.Models
{
    public class Cobranca
    {
        public int Id { get; set; }
        public decimal Valor { get; set; }
        public DateTime DataVencimento { get; set; }
        public DateTime? DataPagamento { get; set; }
        
        public string Status { get; set; } = "Pendente"; // Pendente, Pago, Atrasado

        // Chave Estrangeira relacionando a Cobrança ao Cliente
        public int ClienteId { get; set; }
        public Cliente? Cliente { get; set; }
    }
}