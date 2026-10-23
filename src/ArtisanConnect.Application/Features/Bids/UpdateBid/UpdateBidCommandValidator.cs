using FluentValidation;

namespace ArtisanConnect.Application.Features.Bids.UpdateBid;

public class UpdateBidCommandValidator : AbstractValidator<UpdateBidCommand>
{
    public UpdateBidCommandValidator()
    {
        RuleFor(x => x.BidId).NotEmpty();
        BidRules.ApplyAmount(RuleFor(x => x.Amount));
        BidRules.ApplyEtaMinutes(RuleFor(x => x.EtaMinutes));
        BidRules.ApplyMessage(RuleFor(x => x.Message));
    }
}
