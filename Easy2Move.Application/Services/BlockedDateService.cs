using Easy2Move.Application.Data;
using Easy2Move.Contracts.Interfaces;
using Easy2Move.Contracts.Models;
using Microsoft.EntityFrameworkCore;

namespace Easy2Move.Application.Services;

public class BlockedDateService(BookingDbContext context) : IBlockedDateService
{
    public async Task<List<BlockedDateDto>> GetAll()
    {
        return await context.BlockedDates.OrderBy(d => d.Datum).ToListAsync();
    }

    public async Task<BlockedDateDto> Create(BlockedDateDto blockedDate)
    {
        var bestaat = await context.BlockedDates.AnyAsync(d => d.Datum.Date == blockedDate.Datum.Date);
        if (bestaat) return await context.BlockedDates.FirstAsync(d => d.Datum.Date == blockedDate.Datum.Date);

        context.BlockedDates.Add(blockedDate);
        await context.SaveChangesAsync();
        return blockedDate;
    }

    // Blokkeert elke dag van "van" tot en met "tot". Dagen die al
    // geblokkeerd zijn, worden overgeslagen (geen dubbels).
    public async Task<List<BlockedDateDto>> CreateRange(DateTime van, DateTime tot, string reden)
    {
        var (start, eind) = van.Date <= tot.Date ? (van.Date, tot.Date) : (tot.Date, van.Date);

        var bestaandeData = await context.BlockedDates
            .Where(d => d.Datum >= start && d.Datum <= eind)
            .Select(d => d.Datum.Date)
            .ToListAsync();

        var nieuwe = new List<BlockedDateDto>();
        for (var dag = start; dag <= eind; dag = dag.AddDays(1))
        {
            if (bestaandeData.Contains(dag)) continue;
            nieuwe.Add(new BlockedDateDto { Datum = dag, Reden = reden });
        }

        context.BlockedDates.AddRange(nieuwe);
        await context.SaveChangesAsync();
        return nieuwe;
    }

    public async Task<bool> Delete(int id)
    {
        var blockedDate = await context.BlockedDates.FindAsync(id);
        if (blockedDate == null) return false;

        context.BlockedDates.Remove(blockedDate);
        await context.SaveChangesAsync();
        return true;
    }
}
