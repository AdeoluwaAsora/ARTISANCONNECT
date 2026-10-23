using FluentValidation;

namespace ArtisanConnect.Application.Features.Artisans.SearchNearbyArtisans;

public class SearchNearbyArtisansQueryValidator : AbstractValidator<SearchNearbyArtisansQuery>
{
    public SearchNearbyArtisansQueryValidator()
    {
        RuleFor(x => x.Latitude)
            .NotNull().WithMessage("Latitude is required.")
            .InclusiveBetween(-90, 90);
        RuleFor(x => x.Longitude)
            .NotNull().WithMessage("Longitude is required.")
            .InclusiveBetween(-180, 180);

        RuleFor(x => x.RadiusKm)
            .GreaterThan(0)
            .LessThanOrEqualTo(SearchNearbyArtisansQuery.MaxRadiusKm)
            .WithMessage($"Search radius must be between 0 and {SearchNearbyArtisansQuery.MaxRadiusKm} km.");

        RuleFor(x => x.Trade).IsInEnum().When(x => x.Trade.HasValue);
    }
}
