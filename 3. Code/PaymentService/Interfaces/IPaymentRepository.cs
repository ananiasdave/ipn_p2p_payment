using System.Threading.Tasks;
using PaymentService.Models;

namespace PaymentService.Interfaces;

public interface IPaymentRepository
{
    Task SavePaymentAsync(Payment payment);
    Task<System.Collections.Generic.List<Payment>> GetPaymentsAsync();
}
