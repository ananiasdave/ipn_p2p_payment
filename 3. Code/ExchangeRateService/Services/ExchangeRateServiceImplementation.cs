using System.Threading.Tasks;
using ExchangeRateService.Interfaces;
using ExchangeRateService.Models;

namespace ExchangeRateService.Services;

public class ExchangeRateServiceImplementation : IExchangeRateService
{
    private readonly System.Collections.Generic.Dictionary<string, decimal> _rates = new()
    {
        { "NAD", 1.0m },
        { "USD", 18.50m }, // 1 USD = 18.50 NAD
        { "EUR", 20.15m }, // 1 EUR = 20.15 NAD
        { "GBP", 23.40m }, // 1 GBP = 23.40 NAD
        { "ZAR", 1.00m },  // 1 ZAR = 1.00 NAD (pegged)
        { "BWP", 1.35m }   // 1 BWP = 1.35 NAD
    };

    public Task<ConvertResponse> ConvertAsync(ConvertRequest request)
    {
        var rate = _rates.ContainsKey(request.Currency.ToUpper()) 
            ? _rates[request.Currency.ToUpper()] 
            : 1.0m;

        return Task.FromResult(new ConvertResponse
        {
            Rate = rate,
            Amount = request.Amount * rate,
            Currency = request.Currency
        });
    }

    public Task<System.Collections.Generic.Dictionary<string, decimal>> GetRatesAsync()
    {
        return Task.FromResult(_rates);
    }

    public Task<System.Collections.Generic.List<string>> GetBicsAsync()
    {
        var bics = new System.Collections.Generic.List<string>
        {
            "BWINNAWX", // Bank Windhoek (NAM)
            "FIRNNAWX", // FNB Namibia (NAM)
            "NEDNNAWX", // Nedbank Namibia (NAM)
            "SBICNAWX", // Standard Bank (NAM)
            "TRUSTBNX", // Trustco Bank (NAM)
            "HSBCGB2L", // HSBC London (UK)
            "CITIUS33", // Citibank New York (USA)
            "DEUTDEFF", // Deutsche Bank (Germany)
            "CHASSF33", // JPMorgan Chase (USA)
            "BARCGB2L", // Barclays Bank (UK)
            "DBSSSGXX", // DBS Bank (Singapore)
            "STCBZAJJ", // Standard Chartered (South Africa)
            "ABNANL2A"  // ABN AMRO (Netherlands)
        };
        return Task.FromResult(bics);
    }
}
