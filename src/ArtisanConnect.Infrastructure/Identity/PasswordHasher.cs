using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace ArtisanConnect.Infrastructure.Identity;

/// <summary>
/// Wraps Microsoft.AspNetCore.Identity's PasswordHasher&lt;T&gt; rather than
/// hand-rolling PBKDF2/bcrypt calls. It's a well-audited implementation
/// already in the dependency tree (via Identity.EntityFrameworkCore), and
/// its output format is self-describing (embeds algorithm + iteration
/// count), so we can bump iteration counts later without a big-bang
/// migration of every existing hash.
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<User> _identityHasher = new();

    public string Hash(string password) =>
        _identityHasher.HashPassword(user: null!, password);

    public bool Verify(string hashedPassword, string providedPassword)
    {
        var result = _identityHasher.VerifyHashedPassword(user: null!, hashedPassword, providedPassword);
        return result is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded;
    }
}
