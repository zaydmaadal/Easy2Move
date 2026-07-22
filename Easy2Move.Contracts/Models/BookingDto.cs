using System.ComponentModel.DataAnnotations;

namespace Easy2Move.Contracts.Models;

public class BookingDto
{
    public int Id { get; set; }

    // Klantgegevens
    [Required, MinLength(2), MaxLength(100)]
    public string KlantNaam { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(20)]
    public string Telefoon { get; set; } = string.Empty;

    // Locatie
    [Required, MaxLength(150)]
    public string Straat { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string Huisnummer { get; set; } = string.Empty;

    [Required, RegularExpression(@"^\d{4}$", ErrorMessage = "Postcode moet 4 cijfers zijn.")]
    public string Postcode { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Gemeente { get; set; } = string.Empty;

    [Range(0, 10)]
    public int Verdieping { get; set; }

    // Planning
    public DateTime Datum { get; set; }

    [Required, RegularExpression(@"^\d{2}:\d{2} - \d{2}:\d{2}$", ErrorMessage = "Ongeldig tijdslot-formaat.")]
    public string Tijdslot { get; set; } = string.Empty;

    [Range(1, 24)]
    public int GeschatteDuurUren { get; set; }

    // Extra
    [MaxLength(1000)]
    public string Opmerkingen { get; set; } = string.Empty;

    public BookingStatus Status { get; set; } = BookingStatus.Aangevraagd;
    public DateTime AangemaaktOp { get; set; } = DateTime.UtcNow;
}
