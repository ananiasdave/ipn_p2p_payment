namespace AccountService.Models;

public class Contact
{
    public string Name { get; set; } = string.Empty;
    public string Account { get; set; } = string.Empty;
    public string Bank { get; set; } = string.Empty;
    public string Bic { get; set; } = string.Empty;
    public bool IsInternational { get; set; }
    public string? Country { get; set; }
}
