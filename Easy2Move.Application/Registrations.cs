using Easy2Move.Application.Data;
using Easy2Move.Application.Services;
using Easy2Move.Contracts.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Easy2Move.Application;

public static class Registrations
{
    public static IServiceCollection RegisterApplication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<BookingDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("BookingDb")));

        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IBlockedDateService, BlockedDateService>();
        return services;
    }
}