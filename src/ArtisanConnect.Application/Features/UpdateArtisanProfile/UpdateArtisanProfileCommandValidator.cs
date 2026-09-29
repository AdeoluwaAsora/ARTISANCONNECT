using FluentValidation;

namespace ArtisanConnect.Application.Features.Artisans.UpdateArtisanProfile;

public class UpdateArtisanProfileCommandValidator : AbstractValidator<UpdateArtisanProfileCommand>
{
    public UpdateArtisanProfileCommandValidator()
    {
        RuleFor(x => x.Trade).IsInEnum();

        RuleFor(x => x.YearsOfExperience)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(70);

        RuleFor(x => x.Bio)
            .MaximumLength(1000);

        RuleFor(x => x.HourlyRate)
            .GreaterThan(0)
            .When(x => x.HourlyRate.HasValue)
            .WithMessage("Hourly rate must be greater than zero.");
    }
}