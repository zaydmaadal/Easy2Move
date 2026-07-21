# Render heeft geen ingebouwde .NET-ondersteuning, dus draait dit via Docker.
# Twee fases: eerst bouwen met de volledige SDK, dan enkel het resultaat
# meenemen naar een kleine runtime-image (geen SDK/compiler in productie).

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Alleen de .csproj-bestanden eerst kopiëren en restoren, zodat Docker die
# restore-laag hergebruikt (cachet) zolang de package-referenties niet
# veranderen - snellere volgende builds.
COPY Easy2Move.API/Easy2Move.API.csproj Easy2Move.API/
COPY Easy2Move.Application/Easy2Move.Application.csproj Easy2Move.Application/
COPY Easy2Move.Contracts/Easy2Move.Contracts.csproj Easy2Move.Contracts/
RUN dotnet restore Easy2Move.API/Easy2Move.API.csproj

COPY Easy2Move.API/ Easy2Move.API/
COPY Easy2Move.Application/ Easy2Move.Application/
COPY Easy2Move.Contracts/ Easy2Move.Contracts/

RUN dotnet publish Easy2Move.API/Easy2Move.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render kent de poort pas op het moment dat de container start (via de
# PORT environment variable) - vandaar dat dit in het ENTRYPOINT staat en
# niet als vaste ENV hierboven.
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-10000} dotnet Easy2Move.API.dll"]
