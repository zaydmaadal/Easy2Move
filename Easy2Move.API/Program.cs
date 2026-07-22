using System.Threading.RateLimiting;
using Easy2Move.Application;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Lokaal, genegeerd door git (zie .gitignore): hier komt de echte
// AdminKey te staan. Werkt ongeacht ASPNETCORE_ENVIRONMENT, in
// tegenstelling tot appsettings.Development.json of user-secrets.
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.RegisterApplication(builder.Configuration);

// Nodig zodra de frontend op een ander domein draait dan de API (nu nog
// niet het geval in dev, want Vite's proxy maakt dat onzichtbaar voor de
// browser). Toegestane origins staan in config onder "Cors:AllowedOrigins"
// - lokaal in appsettings.Local.json, op Render via environment variable
// Cors__AllowedOrigins__0 zodra de frontend een echte URL heeft.
var toegestaneOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(toegestaneOrigins).AllowAnyHeader().AllowAnyMethod());
});

// Render zit tussen de klant en onze container in als reverse proxy, dus
// zonder dit ziet ASP.NET Core voor elk verzoek het IP van Render's proxy
// in plaats van het echte klant-IP - dat zou de rate limiter hieronder
// nutteloos maken (iedereen deelt dan dezelfde "IP"-partitie). Render's
// proxy-IP is niet vast/gekend, dus KnownNetworks/KnownProxies leegmaken
// om de X-Forwarded-For header alsnog te vertrouwen.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// POST /api/bookings is bewust publiek en sleutelloos (klanten hebben geen
// account) - dus is dat de enige plek die kwetsbaar is voor spam-boekingen.
// Max 5 pogingen per minuut per IP, geen wachtrij: wie de limiet raakt
// krijgt meteen een duidelijke 429 i.p.v. te wachten op een vrije plek.
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("PubliekeBoeking", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "onbekend";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { message = "Te veel boekingspogingen. Probeer het over een minuutje opnieuw." },
            cancellationToken);
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseRateLimiter();

app.MapControllers();

// Publiek, geen database-call: voor Render's eigen health-check en
// voor de keep-alive ping (zie .github/workflows/keep-alive.yml) die
// voorkomt dat de gratis service na 15 min inactiviteit in slaap valt.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
