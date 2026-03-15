namespace PaymentService.Models;

public class PaymentRequest
{
    public string SenderAccountNumber { get; set; } = string.Empty;
    public string ReceiverAccountNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "NAD";
    public string Reference { get; set; } = string.Empty;
}
