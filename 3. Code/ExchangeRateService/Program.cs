using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using ExchangeRateService.Interfaces;
using ExchangeRateService.Services;
using ExchangeRateService.Models;

var builder = WebApplication.CreateBuilder(args);

// Register Services for DI
builder.Services.AddScoped<IExchangeRateService, ExchangeRateServiceImplementation>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapPost("/api/convert", async (ConvertRequest request, IExchangeRateService exchangeRateService) =>
{
    var result = await exchangeRateService.ConvertAsync(request);
    return Results.Ok(result);
})
.WithName("Convert");

app.MapGet("/api/rates", async (IExchangeRateService exchangeRateService) =>
{
    var rates = await exchangeRateService.GetRatesAsync();
    return Results.Ok(rates);
})
.WithName("GetRates");

app.MapGet("/api/rates/bics", async (IExchangeRateService exchangeRateService) =>
{
    var bics = await exchangeRateService.GetBicsAsync();
    return Results.Ok(bics);
})
.WithName("GetBics");

app.Run();
