using System.Collections.Generic;
using System.Threading.Tasks;
using AccountService.Models;

namespace AccountService.Interfaces;

public interface IAccountService
{
    Task<List<Contact>> GetContactsAsync();
}
