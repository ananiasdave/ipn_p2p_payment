using System.Threading.Tasks;
using PaymentService.Models;

namespace PaymentService.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponseBase> ProcessPaymentAsync(PaymentRequest request);
    Task<System.Collections.Generic.List<Payment>> GetPaymentHistoryAsync();
    Task<PaymentSummaryResponse> GetPaymentSummaryAsync();
}
