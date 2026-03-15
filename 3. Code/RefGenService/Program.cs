using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using RefGenService.Interfaces;
using RefGenService.Services;

var builder = WebApplication.CreateBuilder(args);

// Register Services for DI
builder.Services.AddScoped<IReferenceGeneratorService, ReferenceGeneratorService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapPost("/api/generate-reference", async (IReferenceGeneratorService refGenService) =>
{
    return await refGenService.GenerateReferenceAsync();
})
.WithName("GenerateReference");

app.Run();
