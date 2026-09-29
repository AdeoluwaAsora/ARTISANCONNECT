namespace ArtisanConnect.Application.Common.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string entityName, object key)
        : base($"Entity \"{entityName}\" with key ({key}) was not found.")
    {
    }

    public NotFoundException(string message) : base(message)
    {
    }
}


public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}


public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException() : base("You do not have permission to perform this action.")
    {
    }

    public ForbiddenAccessException(string message) : base(message)
    {
    }
}

public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message)
    {
    }
}
