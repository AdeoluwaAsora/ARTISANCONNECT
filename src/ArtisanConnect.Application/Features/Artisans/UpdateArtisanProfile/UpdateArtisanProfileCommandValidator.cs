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

        RuleFor(x => x)
            .Must(x => x.Latitude.HasValue == x.Longitude.HasValue)
            .WithName("Location")
            .WithMessage("Send both latitude and longitude, or neither.");

        RuleFor(x => x.Latitude!.Value)
            .InclusiveBetween(-90, 90)
            .When(x => x.Latitude.HasValue)
            .WithName("Latitude");

        RuleFor(x => x.Longitude!.Value)
            .InclusiveBetween(-180, 180)
            .When(x => x.Longitude.HasValue)
            .WithName("Longitude");

        RuleFor(x => x.City)
            .MaximumLength(100);
    }
}