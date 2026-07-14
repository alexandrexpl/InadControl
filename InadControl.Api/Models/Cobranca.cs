using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace InadControl.Api.Models
{
    public class Cobranca
    {
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")] // Garante que o banco guarde centavos corretamente
        public decimal Valor { get; set; }

        [Required]
        public DateTime DataVencimento { get; set; }
        
        public DateTime? DataPagamento { get; set; }
        
        [MaxLength(20)]
        public string Status { get; set; } = "Pendente"; // Pendente, Pago, Atrasado

        [MaxLength(50)]
        public string? TipoDocumento { get; set; }

        [MaxLength(100)]
        public string? NumeroDocumento { get; set; }

        [MaxLength(500)]
        public string? Observacao { get; set; } 

        // Chave Estrangeira relacionando a Cobrança ao Cliente
        [Required]
        public int ClienteId { get; set; }

        [JsonIgnore] // Impede o "Ciclo Infinito" de JSON na hora de enviar para o React
        public Cliente? Cliente { get; set; }
    }
}