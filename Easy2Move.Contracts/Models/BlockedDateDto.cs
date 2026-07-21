namespace Easy2Move.Contracts.Models;

// Een hele dag waarop Easy2Move niet beschikbaar is (bv. vakantie).
// Bewust eenvoudig gehouden: hele dagen, geen uurblokken.
public class BlockedDateDto
{
    public int Id { get; set; }
    public DateTime Datum { get; set; }
    public string Reden { get; set; } = string.Empty;
}
