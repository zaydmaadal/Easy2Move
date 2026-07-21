using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Easy2Move.Application.Migrations
{
    /// <inheritdoc />
    public partial class EnableRowLevelSecurity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Onze .NET-app verbindt als tabel-eigenaar (rol "postgres"),
            // dus RLS heeft geen effect op wat de app zelf mag doen -
            // het sluit enkel Supabase's ingebouwde, ongebruikte
            // PostgREST-laag af voor iedereen zonder die rol.
            migrationBuilder.Sql("ALTER TABLE public.\"Bookings\" ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"BlockedDates\" ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"__EFMigrationsHistory\" ENABLE ROW LEVEL SECURITY;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE public.\"Bookings\" DISABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"BlockedDates\" DISABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"__EFMigrationsHistory\" DISABLE ROW LEVEL SECURITY;");
        }
    }
}
