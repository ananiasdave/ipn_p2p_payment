using System.Collections.Generic;
using System.Threading.Tasks;
using AccountService.Interfaces;
using AccountService.Models;

namespace AccountService.Services;

public class AccountServiceImplementation : IAccountService
{
    public Task<List<Contact>> GetContactsAsync()
    {
        var contacts = new List<Contact>
        {
            new Contact { Name = "Johannes Shivute", Account = "1234567890", Bank = "Bank Windhoek", Bic = "BWINNAWX", IsInternational = false },
            new Contact { Name = "Penda Amukoto", Account = "0987654321", Bank = "FNB Namibia", Bic = "FIRNNAWX", IsInternational = false },
            new Contact { Name = "Maria Nangombe", Account = "1122334455", Bank = "Nedbank Namibia", Bic = "NEDNNAWX", IsInternational = false },
            new Contact { Name = "Ndinelao Hamutenya", Account = "5566778899", Bank = "Standard Bank", Bic = "SBICNAWX", IsInternational = false },
            new Contact { Name = "Kevin O'Brien", Account = "6677889900", Bank = "HSBC London", Bic = "HSBCGB2L", IsInternational = true, Country = "United Kingdom" },
            new Contact { Name = "Sarah Schmidt", Account = "9988776655", Bank = "Deutsche Bank", Bic = "DEUTDEFF", IsInternational = true, Country = "Germany" }
        };

        return Task.FromResult(contacts);
    }
}
