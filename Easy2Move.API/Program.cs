using Easy2Move.Application;

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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.MapControllers();

// Publiek, geen database-call: voor Render's eigen health-check en
// voor de keep-alive ping (zie .github/workflows/keep-alive.yml) die
// voorkomt dat de gratis service na 15 min inactiviteit in slaap valt.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
