using System.Threading.Tasks;
using ExchangeRateService.Interfaces;
using ExchangeRateService.Models;

namespace ExchangeRateService.Services;

public class ExchangeRateServiceImplementation : IExchangeRateService
{
    public Task<ConvertResponse> ConvertAsync(ConvertRequest request)
    {
        return Task.FromResult(new ConvertResponse
        {
            Rate = 1.0m,
            Amount = request.Amount,
            Currency = request.Currency
        });
    }
}
