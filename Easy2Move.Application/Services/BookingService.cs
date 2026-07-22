using Easy2Move.Application.Data;
using Easy2Move.Application.Exceptions;
using Easy2Move.Contracts.Interfaces;
using Easy2Move.Contracts.Models;
using Microsoft.EntityFrameworkCore;

namespace Easy2Move.Application.Services;

public class BookingService(BookingDbContext context) : IBookingService
{
    public async Task<List<BookingDto>> GetAllBookings()
    {
        return await context.Bookings.ToListAsync();
    }

    public async Task<BookingDto?> GetBookingById(int id)
    {
        return await context.Bookings.FindAsync(id);
    }

    public async Task<BookingDto> CreateBooking(BookingDto booking)
    {
        await GarandeerNietGeblokkeerd(booking.Datum);
        await GarandeerGeenConflict(booking.Datum, booking.Tijdslot, uitgeslotenId: null);

        booking.AangemaaktOp = DateTime.UtcNow;
        context.Bookings.Add(booking);
        await context.SaveChangesAsync();
        return booking;
    }

    public async Task<BookingDto?> UpdateBooking(int id, BookingDto booking)
    {
        var existing = await context.Bookings.FindAsync(id);
        if (existing == null) return null;

        // Enkel controleren als de datum echt verandert - anders zou een
        // dag die pas ná het boeken geblokkeerd werd (bv. vakantie) het
        // beheer van die bestaande boeking (status wijzigen, etc.)
        // onmogelijk maken.
        if (booking.Datum.Date != existing.Datum.Date)
        {
            await GarandeerNietGeblokkeerd(booking.Datum);
        }
        await GarandeerGeenConflict(booking.Datum, booking.Tijdslot, uitgeslotenId: id);

        existing.KlantNaam = booking.KlantNaam;
        existing.Email = booking.Email;
        existing.Telefoon = booking.Telefoon;
        existing.Straat = booking.Straat;
        existing.Huisnummer = booking.Huisnummer;
        existing.Postcode = booking.Postcode;
        existing.Gemeente = booking.Gemeente;
        existing.Verdieping = booking.Verdieping;
        existing.Datum = booking.Datum;
        existing.Tijdslot = booking.Tijdslot;
        existing.GeschatteDuurUren = booking.GeschatteDuurUren;
        existing.Opmerkingen = booking.Opmerkingen;
        existing.Status = booking.Status;

        await context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteBooking(int id)
    {
        var booking = await context.Bookings.FindAsync(id);
        if (booking == null) return false;

        context.Bookings.Remove(booking);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<List<string>> GetBezetteTijdslotenOp(DateTime datum)
    {
        return await context.Bookings
            .Where(b => b.Datum.Date == datum.Date && b.Status != BookingStatus.Geannuleerd)
            .Select(b => b.Tijdslot)
            .ToListAsync();
    }

    private async Task GarandeerNietGeblokkeerd(DateTime datum)
    {
        var geblokkeerd = await context.BlockedDates.AnyAsync(d => d.Datum.Date == datum.Date);
        if (geblokkeerd)
        {
            throw new BookingConflictException($"Easy2Move is niet beschikbaar op {datum:dd/MM/yyyy}.");
        }
    }

    // Twee boekingen op dezelfde dag mogen elkaar niet overlappen in tijd.
    // "Geannuleerd" telt niet mee: die plek is weer vrij.
    private async Task GarandeerGeenConflict(DateTime datum, string tijdslot, int? uitgeslotenId)
    {
        var (start, eind) = ParseTijdslot(tijdslot);

        var opDezelfdeDag = await context.Bookings
            .Where(b => b.Datum.Date == datum.Date && b.Status != BookingStatus.Geannuleerd)
            .ToListAsync();

        foreach (var bestaande in opDezelfdeDag)
        {
            if (uitgeslotenId.HasValue && bestaande.Id == uitgeslotenId.Value) continue;

            var (bestaandeStart, bestaandeEind) = ParseTijdslot(bestaande.Tijdslot);
            var overlapt = start < bestaandeEind && bestaandeStart < eind;
            if (overlapt)
            {
                throw new BookingConflictException(
                    $"Er is al een boeking op {datum:dd/MM/yyyy} tussen {bestaande.Tijdslot}.");
            }
        }
    }

    // "14:30 - 16:30" -> (14:30, 16:30). Sloten die over middernacht heen
    // gaan (bv. "23:00 - 01:00") krijgen een eindtijd na 24:00 zodat de
    // vergelijking hierboven correct blijft.
    private static (TimeSpan start, TimeSpan eind) ParseTijdslot(string tijdslot)
    {
        var delen = tijdslot.Split('-', StringSplitOptions.TrimEntries);
        var start = TimeSpan.Parse(delen[0]);
        var eind = TimeSpan.Parse(delen[1]);
        if (eind <= start) eind += TimeSpan.FromDays(1);
        return (start, eind);
    }
}
