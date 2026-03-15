using System;

namespace PaymentService.Models;

public class Payment
{
    public int Id { get; set; }
    public string SenderAccountNumber { get; set; } = string.Empty;
    public string ReceiverAccountNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "NAD";
    public string Reference { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public string? ClientReference { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
