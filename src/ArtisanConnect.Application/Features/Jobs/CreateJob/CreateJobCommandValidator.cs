using FluentValidation;

namespace ArtisanConnect.Application.Features.Jobs.CreateJob;

public class CreateJobCommandValidator : AbstractValidator<CreateJobCommand>
{
    public CreateJobCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.RequiredTrade).IsInEnum();
        RuleFor(x => x.Urgency).IsInEnum();
        RuleFor(x => x.BudgetMin).GreaterThan(0);
        RuleFor(x => x.BudgetMax)
            .GreaterThanOrEqualTo(x => x.BudgetMin)
            .WithMessage("Maximum budget must be at least the minimum budget.");
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90);
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180);
        RuleFor(x => x.Address).MaximumLength(500);
    }
}