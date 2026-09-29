using ArtisanConnect.Core.Enums;
using FluentValidation;

namespace ArtisanConnect.Application.Features.Authentication.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password)
            .WithMessage("Passwords do not match.");

        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[0-9]{7,15}$")
            .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber))
            .WithMessage("Phone number must be a valid international format.");

        RuleFor(x => x.Role)
            .IsInEnum()
            .Must(role => role != UserRole.Admin)
            .WithMessage("Admin accounts cannot be self-registered.");

        RuleFor(x => x.Trade)
            .NotNull()
            .WithMessage("Trade is required for artisan registration.")
            .When(x => x.Role == UserRole.Artisan);

        RuleFor(x => x.Trade)
            .Null()
            .WithMessage("Trade should not be provided for non-artisan accounts.")
            .When(x => x.Role != UserRole.Artisan);

        RuleFor(x => x.YearsOfExperience)
            .NotNull()
            .WithMessage("Years of experience is required for artisan registration.")
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(70)
            .When(x => x.Role == UserRole.Artisan);

        RuleFor(x => x.YearsOfExperience)
            .Null()
            .WithMessage("Years of experience should not be provided for non-artisan accounts.")
            .When(x => x.Role != UserRole.Artisan);
    }
}