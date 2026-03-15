using System;
using System.Threading.Tasks;
using RefGenService.Interfaces;
using RefGenService.Models;

namespace RefGenService.Services;

public class ReferenceGeneratorService : IReferenceGeneratorService
{
    public Task<RefGenResponse> GenerateReferenceAsync()
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var randomPart = Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();
        
        return Task.FromResult(new RefGenResponse 
        { 
            Reference = $"REF-{datePart}-{randomPart}" 
        });
    }
}
