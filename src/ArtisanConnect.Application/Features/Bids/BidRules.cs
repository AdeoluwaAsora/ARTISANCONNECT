using FluentValidation;

namespace ArtisanConnect.Application.Features.Bids;

/// <summary>Validation rules shared by submitting and editing a bid.</summary>
public static class BidRules
{
    public const int MinEtaMinutes = 5;
    public const int MaxEtaMinutes = 7 * 24 * 60; // one week
    public const int MinMessageLength = 10;
    public const int MaxMessageLength = 1000;

    public static void ApplyAmount<T>(IRuleBuilder<T, decimal> rule) =>
        rule.GreaterThan(0).LessThan(100_000_000);

    public static void ApplyEtaMinutes<T>(IRuleBuilder<T, int> rule) =>
        rule.InclusiveBetween(MinEtaMinutes, MaxEtaMinutes)
            .WithMessage($"ETA must be between {MinEtaMinutes} minutes and one week.");

    public static void ApplyMessage<T>(IRuleBuilder<T, string> rule) =>
        rule.NotEmpty()
            .MinimumLength(MinMessageLength)
            .MaximumLength(MaxMessageLength);
}
