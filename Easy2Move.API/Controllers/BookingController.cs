using Easy2Move.API.Filters;
using Easy2Move.Application.Exceptions;
using Easy2Move.Contracts.Interfaces;
using Easy2Move.Contracts.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Easy2Move.API.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingController(IBookingService bookingService) : ControllerBase
{
    // Alleen de admin-pagina mag alle boekingen zien, wijzigen of verwijderen.
    // POST blijft publiek: klanten moeten zonder sleutel kunnen boeken.
    [HttpGet]
    [AdminOnly]
    public async Task<ActionResult<List<BookingDto>>> GetAll()
    {
        var bookings = await bookingService.GetAllBookings();
        return Ok(bookings);
    }

    [HttpGet("{id:int}")]
    [AdminOnly]
    public async Task<ActionResult<BookingDto>> GetById(int id)
    {
        var booking = await bookingService.GetBookingById(id);
        if (booking == null) return NotFound();
        return Ok(booking);
    }

    // Publiek: geen klantgegevens, enkel welke tijdsloten al bezet zijn
    // op een dag. Zo kan het boekingsformulier dubbele boekingen weren.
    [HttpGet("bezet")]
    public async Task<ActionResult<List<string>>> GetBezet([FromQuery] DateTime datum)
    {
        var tijdsloten = await bookingService.GetBezetteTijdslotenOp(datum);
        return Ok(tijdsloten);
    }

    // Publiek: een klant mag nooit zelf een status meesturen (bv. meteen
    // "Bevestigd" claimen). We negeren wat er binnenkomt en forceren de
    // startstatus zelf.
    [HttpPost]
    [EnableRateLimiting("PubliekeBoeking")]
    public async Task<ActionResult<BookingDto>> Create(BookingDto booking)
    {
        booking.Status = "Aangevraagd";
        try
        {
            var created = await bookingService.CreateBooking(booking);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (BookingConflictException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // Admin-only: voor boekingen die telefonisch binnenkomen. Hier mag de
    // status wel meteen ingesteld worden, bv. rechtstreeks "Bevestigd".
    [HttpPost("admin")]
    [AdminOnly]
    public async Task<ActionResult<BookingDto>> CreateAlsAdmin(BookingDto booking)
    {
        try
        {
            var created = await bookingService.CreateBooking(booking);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (BookingConflictException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [AdminOnly]
    public async Task<ActionResult<BookingDto>> Update(int id, BookingDto booking)
    {
        try
        {
            var updated = await bookingService.UpdateBooking(id, booking);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        catch (BookingConflictException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult> Delete(int id)
    {
        var success = await bookingService.DeleteBooking(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
