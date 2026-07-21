using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Easy2Move.Application.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BlockedDates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Datum = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Reden = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockedDates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    KlantNaam = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Telefoon = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Straat = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Huisnummer = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Postcode = table.Column<string>(type: "text", nullable: false),
                    Gemeente = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Verdieping = table.Column<int>(type: "integer", nullable: false),
                    Datum = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Tijdslot = table.Column<string>(type: "text", nullable: false),
                    GeschatteDuurUren = table.Column<int>(type: "integer", nullable: false),
                    Opmerkingen = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlockedDates");

            migrationBuilder.DropTable(
                name: "Bookings");
        }
    }
}
