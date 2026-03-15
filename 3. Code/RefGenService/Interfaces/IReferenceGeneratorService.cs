using System.Threading.Tasks;
using RefGenService.Models;

namespace RefGenService.Interfaces;

public interface IReferenceGeneratorService
{
    Task<RefGenResponse> GenerateReferenceAsync();
}
