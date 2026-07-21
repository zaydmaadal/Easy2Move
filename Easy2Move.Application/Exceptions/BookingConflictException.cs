namespace Easy2Move.Application.Exceptions;

// Gegooid wanneer een nieuwe of bijgewerkte boeking overlapt met een
// bestaande boeking op dezelfde dag en hetzelfde tijdstip.
public class BookingConflictException(string message) : Exception(message);
