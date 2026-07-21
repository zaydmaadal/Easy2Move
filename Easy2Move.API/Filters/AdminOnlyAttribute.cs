using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Easy2Move.API.Filters;

// Simpele shared-secret bescherming: de admin-pagina stuurt een sleutel mee
// in de header "X-Admin-Key". Geen gebruikersaccounts nodig zolang er maar
// één beheerder is (de eigenaar) - vergelijkbaar met een API-key i.p.v.
// een volledig login-systeem met wachtwoorden per gebruiker.
public class AdminOnlyAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var configuratie = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        var verwachteSleutel = configuratie["AdminKey"];

        var meegegeven = context.HttpContext.Request.Headers["X-Admin-Key"].ToString();

        if (string.IsNullOrEmpty(verwachteSleutel) || meegegeven != verwachteSleutel)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Ongeldige of ontbrekende admin-sleutel." });
            return;
        }

        await next();
    }
}
