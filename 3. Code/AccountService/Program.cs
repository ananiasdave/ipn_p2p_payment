using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using AccountService.Interfaces;
using AccountService.Services;

var builder = WebApplication.CreateBuilder(args);

// Register Services for DI
builder.Services.AddScoped<IAccountService, AccountServiceImplementation>();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

var app = builder.Build();

app.MapGet("/api/accounts/contacts", async (IAccountService accountService) =>
{
    var contacts = await accountService.GetContactsAsync();
    return Results.Ok(contacts);
});

app.Run();
