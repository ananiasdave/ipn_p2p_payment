namespace PaymentService.Models;

public abstract class PaymentResponseBase
{
    public string Status { get; set; } = string.Empty;
}

public class PaymentSuccessResponse : PaymentResponseBase
{
    public string TransactionId { get; set; } = string.Empty;
    public string ClientReference { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    
    public PaymentSuccessResponse()
    {
        Status = "SUCCESS";
    }
}

public class PaymentErrorResponse : PaymentResponseBase
{
    public PaymentErrorDetails Error { get; set; } = new();
    
    public PaymentErrorResponse()
    {
        Status = "FAILED";
    }
}

public class PaymentErrorDetails
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class RefGenResponse
{
    public string Reference { get; set; } = string.Empty;
}
