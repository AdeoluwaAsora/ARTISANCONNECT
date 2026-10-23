using FluentValidation;

namespace ArtisanConnect.Application.Features.Bids.SubmitBid;

public class SubmitBidCommandValidator : AbstractValidator<SubmitBidCommand>
{
    public SubmitBidCommandValidator()
    {
        RuleFor(x => x.JobId).NotEmpty();
        BidRules.ApplyAmount(RuleFor(x => x.Amount));
        BidRules.ApplyEtaMinutes(RuleFor(x => x.EtaMinutes));
        BidRules.ApplyMessage(RuleFor(x => x.Message));
    }
}
