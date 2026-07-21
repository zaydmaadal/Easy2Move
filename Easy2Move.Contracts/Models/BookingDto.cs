namespace Easy2Move.Contracts.Models;

public class BookingDto
{
    public int Id { get; set; }

    // Klantgegevens
    public string KlantNaam { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefoon { get; set; } = string.Empty;

    // Locatie
    public string Straat { get; set; } = string.Empty;
    public string Huisnummer { get; set; } = string.Empty;
    public string Postcode { get; set; } = string.Empty;
    public string Gemeente { get; set; } = string.Empty;
    public int Verdieping { get; set; }

    // Planning
    public DateTime Datum { get; set; }
    public string Tijdslot { get; set; } = string.Empty;
    public int GeschatteDuurUren { get; set; }

    // Extra
    public string Opmerkingen { get; set; } = string.Empty;
    public string Status { get; set; } = "Aangevraagd";
    public DateTime AangemaaktOp { get; set; } = DateTime.UtcNow;
}
