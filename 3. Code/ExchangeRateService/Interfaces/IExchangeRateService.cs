using System.Threading.Tasks;
using ExchangeRateService.Models;

namespace ExchangeRateService.Interfaces;

public interface IExchangeRateService
{
    Task<ConvertResponse> ConvertAsync(ConvertRequest request);
    Task<System.Collections.Generic.Dictionary<string, decimal>> GetRatesAsync();
}
