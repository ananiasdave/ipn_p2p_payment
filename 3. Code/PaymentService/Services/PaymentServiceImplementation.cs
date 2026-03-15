using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PaymentService.Interfaces;
using PaymentService.Models;

namespace PaymentService.Services;

public class PaymentServiceImplementation : IPaymentService
{
    private readonly IPaymentRepository _repository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<PaymentServiceImplementation> _logger;

    public PaymentServiceImplementation(
        IPaymentRepository repository,
        IHttpClientFactory httpClientFactory,
        ILogger<PaymentServiceImplementation> logger)
    {
        _repository = repository;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<PaymentResponseBase> ProcessPaymentAsync(PaymentRequest request)
    {
        try
        {
            // 1. Get Reference
            var refClient = _httpClientFactory.CreateClient("RefGen");
            var refGenRes = await refClient.PostAsync("/api/generate-reference", null);
            refGenRes.EnsureSuccessStatusCode();
            var refContent = await refGenRes.Content.ReadFromJsonAsync<RefGenResponse>();
            var clientReference = refContent?.Reference ?? Guid.NewGuid().ToString();

            // 2. Mock Exchange Rate Check
            var exClient = _httpClientFactory.CreateClient("ExchangeRate");
            var exRes = await exClient.PostAsJsonAsync("/api/convert", new { amount = request.Amount, currency = request.Currency });
            
            // 3. Save to DB via Repository
            var payment = new Payment
            {
                SenderAccountNumber = request.SenderAccountNumber,
                ReceiverAccountNumber = request.ReceiverAccountNumber,
                Amount = request.Amount,
                Currency = request.Currency,
                Reference = request.Reference,
                Status = "SUCCESS",
                TransactionId = $"TXN{DateTime.UtcNow:yyyyMMddHHmmss}{new Random().Next(1000,9999)}",
                ClientReference = clientReference
            };
            
            await _repository.SavePaymentAsync(payment);

            return new PaymentSuccessResponse
            {
                TransactionId = payment.TransactionId,
                ClientReference = payment.ClientReference,
                Message = "Payment processed successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Payment processing failed.");
            return new PaymentErrorResponse
            {
                Error = new PaymentErrorDetails
                {
                    Code = "ERR000",
                    Message = "Internal Server Error during processing."
                }
            };
        }
    }
}
