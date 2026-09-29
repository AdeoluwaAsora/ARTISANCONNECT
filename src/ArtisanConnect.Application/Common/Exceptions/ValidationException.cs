using FluentValidation.Results;

namespace ArtisanConnect.Application.Common.Exceptions;

/// <summary>
/// Thrown by ValidationBehavior when FluentValidation finds problems.
/// We reshape the failures into a Dictionary&lt;field, messages[]&gt; because
/// that's the shape most frontend form libraries (including Flutter form
/// packages) expect to map errors back onto individual fields.
/// </summary>
public class ValidationException : Exception
{
    public ValidationException() : base("One or more validation failures occurred.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IEnumerable<ValidationFailure> failures) : this()
    {
        Errors = failures
            .GroupBy(f => f.PropertyName, f => f.ErrorMessage)
            .ToDictionary(g => g.Key, g => g.ToArray());
    }

    public IDictionary<string, string[]> Errors { get; }
}
