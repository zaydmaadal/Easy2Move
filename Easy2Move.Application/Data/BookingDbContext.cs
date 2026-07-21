using Easy2Move.Contracts.Models;
using Microsoft.EntityFrameworkCore;

namespace Easy2Move.Application.Data;

public class BookingDbContext(DbContextOptions<BookingDbContext> options) : DbContext(options)
{
    public DbSet<BookingDto> Bookings => Set<BookingDto>();
    public DbSet<BlockedDateDto> BlockedDates => Set<BlockedDateDto>();
}
