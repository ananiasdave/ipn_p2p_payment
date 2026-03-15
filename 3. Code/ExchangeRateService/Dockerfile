FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["ExchangeRateService/ExchangeRateService.csproj", "ExchangeRateService/"]
RUN dotnet restore "ExchangeRateService/ExchangeRateService.csproj"
COPY ExchangeRateService/. ExchangeRateService/
WORKDIR "/src/ExchangeRateService"
RUN dotnet publish "ExchangeRateService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ExchangeRateService.dll"]
