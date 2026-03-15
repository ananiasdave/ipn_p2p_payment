namespace ExchangeRateService.Models;

public class ConvertRequest
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "NAD";
}

public class ConvertResponse
{
    public decimal Rate { get; set; }
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
}
