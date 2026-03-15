using FluentValidation;

namespace PaymentService.Models;

public class PaymentRequestValidator : AbstractValidator<PaymentRequest>
{
    public PaymentRequestValidator()
    {
        RuleFor(x => x.SenderAccountNumber)
            .NotEmpty().WithErrorCode("ERR001").WithMessage("senderAccountNumber is required.")
            .Matches(@"^\d+$").WithErrorCode("ERR002").WithMessage("senderAccountNumber must contain only digits.")
            .MinimumLength(10).WithErrorCode("ERR003").WithMessage("senderAccountNumber must be at least 10 digits.");

        RuleFor(x => x.ReceiverAccountNumber)
            .NotEmpty().WithErrorCode("ERR001").WithMessage("receiverAccountNumber is required.")
            .Matches(@"^\d+$").WithErrorCode("ERR002").WithMessage("receiverAccountNumber must contain only digits.")
            .MinimumLength(10).WithErrorCode("ERR003").WithMessage("receiverAccountNumber must be at least 10 digits.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithErrorCode("ERR004").WithMessage("amount must be greater than zero.");

        RuleFor(x => x.Currency)
            .NotEmpty().WithErrorCode("ERR001").WithMessage("currency is required.")
            .Must(c => c == "NAD").WithErrorCode("ERR005").WithMessage("currency must be NAD.");

        RuleFor(x => x.Reference)
            .NotEmpty().WithErrorCode("ERR001").WithMessage("reference is required.")
            .MaximumLength(50).WithErrorCode("ERR006").WithMessage("reference cannot exceed 50 characters.");
    }
}
