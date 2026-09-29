
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src


COPY ArtisanConnect.sln .
COPY src/ArtisanConnect.Core/ArtisanConnect.Core.csproj src/ArtisanConnect.Core/
COPY src/ArtisanConnect.Application/ArtisanConnect.Application.csproj src/ArtisanConnect.Application/
COPY src/ArtisanConnect.Infrastructure/ArtisanConnect.Infrastructure.csproj src/ArtisanConnect.Infrastructure/
COPY src/ArtisanConnect.API/ArtisanConnect.API.csproj src/ArtisanConnect.API/
COPY tests/ArtisanConnect.Application.UnitTests/ArtisanConnect.Application.UnitTests.csproj tests/ArtisanConnect.Application.UnitTests/
COPY tests/ArtisanConnect.API.IntegrationTests/ArtisanConnect.API.IntegrationTests.csproj tests/ArtisanConnect.API.IntegrationTests/

RUN dotnet restore ArtisanConnect.sln


COPY . .
RUN dotnet publish src/ArtisanConnect.API/ArtisanConnect.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore


FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app


USER app

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "ArtisanConnect.API.dll"]
