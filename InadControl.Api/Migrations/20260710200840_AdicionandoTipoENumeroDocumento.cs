using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InadControl.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionandoTipoENumeroDocumento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NumeroDocumento",
                table: "Cobrancas",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TipoDocumento",
                table: "Cobrancas",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NumeroDocumento",
                table: "Cobrancas");

            migrationBuilder.DropColumn(
                name: "TipoDocumento",
                table: "Cobrancas");
        }
    }
}
