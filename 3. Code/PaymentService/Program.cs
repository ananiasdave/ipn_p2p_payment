using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using PaymentService.Data;
using PaymentService.Models;
using PaymentService.Interfaces;
using PaymentService.Services;
using PaymentService.Repository;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure EF Core SQLite
var dbPath = "/app/data/ipn_p2p.db";
if (builder.Environment.IsDevelopment())
{
    dbPath = "ipn_p2p.db";
}
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Register Services for DI
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentServiceImplementation>();

// Add Validators
builder.Services.AddValidatorsFromAssemblyContaining<PaymentRequestValidator>();

// Add HttpClient for Microservices
builder.Services.AddHttpClient("RefGen", client =>
{
    var baseUrl = builder.Configuration["BaseUrl:RefGenService"] ?? "http://localhost:8081";
    client.BaseAddress = new Uri(baseUrl);
});
builder.Services.AddHttpClient("ExchangeRate", client =>
{
    var baseUrl = builder.Configuration["BaseUrl:ExchangeRateService"] ?? "http://localhost:8082";
    client.BaseAddress = new Uri(baseUrl);
});

// Configure JSON serialization to match exact challenge output
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

var app = builder.Build();

// Migrate Database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseSwagger();
app.UseSwaggerUI();

// Route depends ONLY on IPaymentService (clean architecture)
app.MapPost("/api/p2p-payment", async (PaymentRequest req, IValidator<PaymentRequest> validator, IPaymentService paymentService) =>
{
    var validationResult = await validator.ValidateAsync(req);
    if (!validationResult.IsValid)
    {
        var firstError = validationResult.Errors[0];
        return Results.BadRequest(new PaymentErrorResponse
        {
            Error = new PaymentErrorDetails
            {
                Code = firstError.ErrorCode,
                Message = firstError.ErrorMessage
            }
        });
    }

    var result = await paymentService.ProcessPaymentAsync(req);
    
    if (result is PaymentErrorResponse)
    {
        return Results.BadRequest(result);
    }
    
    return Results.Ok(result);
})
.WithName("P2pPayment");

app.Run();
