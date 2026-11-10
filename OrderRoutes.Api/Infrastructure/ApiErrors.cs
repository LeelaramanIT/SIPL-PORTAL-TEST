using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace OrderRoutes.Api.Infrastructure;

public class NotFoundException(string message) : Exception(message);
public class ConflictException(string message) : Exception(message);
public class ApiValidationException(IDictionary<string, string[]> errors) : Exception("Validation failed")
{
    public IDictionary<string, string[]> Errors { get; } = errors;
}

/// <summary>Turns service exceptions into RFC 7807 problem responses (400 / 404 / 409).</summary>
public class ApiExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http, Exception ex, CancellationToken ct)
    {
        ProblemDetails? pd = ex switch
        {
            ApiValidationException v => new ValidationProblemDetails(v.Errors) { Status = 400, Title = "Some fields need fixing." },
            NotFoundException => new ProblemDetails { Status = 404, Title = "Not found", Detail = ex.Message },
            ConflictException => new ProblemDetails { Status = 409, Title = "Conflict", Detail = ex.Message },
            _ => null
        };
        if (pd is null) return false;

        http.Response.StatusCode = pd.Status!.Value;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext { HttpContext = http, ProblemDetails = pd, Exception = ex });
    }
}
