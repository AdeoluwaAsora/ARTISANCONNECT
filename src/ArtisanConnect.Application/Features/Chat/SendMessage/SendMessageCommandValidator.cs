using FluentValidation;

namespace ArtisanConnect.Application.Features.Chat.SendMessage;

public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    public const int MaxLength = 2000;

    public SendMessageCommandValidator()
    {
        RuleFor(x => x.ConversationId).NotEmpty();

        RuleFor(x => x.Content)
            .Must(content => !string.IsNullOrWhiteSpace(content))
            .WithMessage("Message can't be empty.")
            .MaximumLength(MaxLength)
            .WithMessage($"Messages can be at most {MaxLength} characters.");
    }
}
