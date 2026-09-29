using FluentValidation;
using MediatR;
using ApplicationValidationException = ArtisanConnect.Application.Common.Exceptions.ValidationException;

namespace ArtisanConnect.Application.Common.Behaviors;

/// <summary>
/// A MediatR pipeline behavior sits around every request like middleware.
/// This one collects every FluentValidation validator registered for the
/// incoming Command/Query and runs them BEFORE the handler executes.
///
/// Why this matters: without it, every handler would need to remember to
/// call "_validator.ValidateAndThrow(request)" as its first line - easy
/// to forget, easy to get wrong. Centralizing it here means validation is
/// structurally guaranteed, not a convention someone can skip.
/// </summary>
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(result => result.Errors)
            .Where(failure => failure is not null)
            .ToList();

        if (failures.Count != 0)
        {
            throw new ApplicationValidationException(failures);
        }

        return await next();
    }
}
