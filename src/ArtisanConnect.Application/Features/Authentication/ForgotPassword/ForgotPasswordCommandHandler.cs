using ArtisanConnect.Application.Common.Interfaces;
using ArtisanConnect.Core.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ArtisanConnect.Application.Features.Authentication.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand>
{
    private static readonly TimeSpan TokenLifetime = TimeSpan.FromMinutes(30);

    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailSender _emailSender;

    public ForgotPasswordCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService,
        IEmailSender emailSender)
    {
        _context = context;
        _tokenService = tokenService;
        _emailSender = emailSender;
    }

    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var emailNormalized = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNormalized, cancellationToken);

        if (user is null)
        {
            return;
        }

        var rawToken = _tokenService.GenerateRefreshToken();
        var tokenHash = _tokenService.HashToken(rawToken);

        _context.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAtUtc = DateTime.UtcNow.Add(TokenLifetime)
        });

        await _context.SaveChangesAsync(cancellationToken);

        var body = $"""
            <p>Hello {user.FirstName},</p>
            <p>Use the code below to reset your password. It expires in 30 minutes.</p>
            <p><strong>{rawToken}</strong></p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            """;

        await _emailSender.SendAsync(user.Email, "Reset your ArtisanConnect password", body, cancellationToken);
    }
}