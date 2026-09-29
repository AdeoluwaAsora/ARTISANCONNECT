using ArtisanConnect.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace ArtisanConnect.Infrastructure.Email;

public class LoggingEmailSender : IEmailSender
{
    private readonly ILogger<LoggingEmailSender> _logger;

    public LoggingEmailSender(ILogger<LoggingEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[EMAIL - NOT ACTUALLY SENT] To: {ToEmail} | Subject: {Subject}\n{Body}",
            toEmail, subject, htmlBody);

        return Task.CompletedTask;
    }
}