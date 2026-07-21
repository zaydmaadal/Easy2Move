using Easy2Move.Contracts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Easy2Move.Application.Data;

public class BookingDbContext(DbContextOptions<BookingDbContext> options) : DbContext(options)
{
    public DbSet<BookingDto> Bookings => Set<BookingDto>();
    public DbSet<BlockedDateDto> BlockedDates => Set<BlockedDateDto>();

    // Onze datums zijn gewoon "welke dag/moment", geen tijdzone-gevoelige
    // waarden, dus de kolom wordt "without time zone" (negeert Kind, net
    // zoals SQLite altijd al deed). Maar C#-kant zet soms Kind=Utc
    // (DateTime.UtcNow) en soms Kind=Unspecified (uit JSON) - Npgsql
    // aanvaardt voor zo'n kolom enkel Unspecified. Deze converter
    // normaliseert dat altijd, ongeacht waar de DateTime vandaan komt.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => DateTime.SpecifyKind(v, DateTimeKind.Unspecified),
            v => DateTime.SpecifyKind(v, DateTimeKind.Unspecified));

        var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Unspecified) : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Unspecified) : v);

        foreach (var entiteit in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entiteit.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetColumnType("timestamp without time zone");
                    property.SetValueConverter(dateTimeConverter);
                }
                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetColumnType("timestamp without time zone");
                    property.SetValueConverter(nullableDateTimeConverter);
                }
            }
        }
    }
}
