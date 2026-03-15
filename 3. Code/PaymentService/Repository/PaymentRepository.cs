using System.Threading.Tasks;
using PaymentService.Data;
using PaymentService.Interfaces;
using PaymentService.Models;

namespace PaymentService.Repository;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task SavePaymentAsync(Payment payment)
    {
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
    }
}
