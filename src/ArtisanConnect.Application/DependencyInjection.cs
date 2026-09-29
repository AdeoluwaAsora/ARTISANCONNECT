using System.Reflection;
using ArtisanConnect.Application.Common.Behaviors;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ArtisanConnect.Application;

/// <summary>
/// Every layer exposes exactly one "AddXyz" extension method that
/// Program.cs calls. This is the only entry point into the Application
/// layer's DI wiring - nothing in API needs to know MediatR or
/// FluentValidation exist, it just calls builder.Services.AddApplication().
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);

            // Order matters: validation runs before the handler executes,
            // so a request never reaches business logic in an invalid state.
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(assembly);

        services.AddAutoMapper(assembly);

        return services;
    }
}
