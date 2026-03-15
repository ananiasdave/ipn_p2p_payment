using System.Threading.Tasks;
using PaymentService.Models;

namespace PaymentService.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponseBase> ProcessPaymentAsync(PaymentRequest request);
}
