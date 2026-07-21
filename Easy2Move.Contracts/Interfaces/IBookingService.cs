using Easy2Move.Contracts.Models;
namespace Easy2Move.Contracts.Interfaces;


public interface IBookingService
{
    Task<List<BookingDto>> GetAllBookings();
    Task<BookingDto?> GetBookingById(int id);
    Task<BookingDto> CreateBooking(BookingDto booking);
    Task<BookingDto?> UpdateBooking(int id, BookingDto booking);
    Task<bool> DeleteBooking(int id);

    // Publiek, geen klantgegevens: enkel de bezette tijdsloten op een dag,
    // zodat het boekingsformulier dubbele boekingen kan voorkomen.
    Task<List<string>> GetBezetteTijdslotenOp(DateTime datum);
}

