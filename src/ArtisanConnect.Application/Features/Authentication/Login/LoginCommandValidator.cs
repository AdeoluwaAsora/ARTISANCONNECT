using FluentValidation;

namespace ArtisanConnect.Application.Features.Authentication.Login;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        // Deliberately just "not empty" - checking length/complexity here
        // would let an attacker distinguish "wrong password" from "your
        // password format was rejected", a minor information leak. The
        // actual match check happens in the handler.
        RuleFor(x => x.Password)
            .NotEmpty();
    }
}
