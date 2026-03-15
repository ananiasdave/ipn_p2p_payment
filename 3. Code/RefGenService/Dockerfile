FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["RefGenService/RefGenService.csproj", "RefGenService/"]
RUN dotnet restore "RefGenService/RefGenService.csproj"
COPY RefGenService/. RefGenService/
WORKDIR "/src/RefGenService"
RUN dotnet publish "RefGenService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "RefGenService.dll"]
