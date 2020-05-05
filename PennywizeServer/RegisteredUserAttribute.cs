using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using PennywizeServer.Controllers;
using PennywizeServer.Models;

namespace PennywizeServer
{
    public class RegisteredUserAttribute : TypeFilterAttribute
    {
        public RegisteredUserAttribute() : base(typeof(RegisteredUserFilter)) { }

        private class RegisteredUserFilter : IAsyncActionFilter
        {
            private readonly PennywizeContext dbContext;
            public RegisteredUserFilter(PennywizeContext dbContext) => this.dbContext = dbContext;

            public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
            {
                var claims = context.HttpContext.User.Claims;
                var oauthSub = claims.First(c => c.Type == "sub").Value;
                var oauthIss = claims.First(c => c.Type == "iss").Value;

                var allowNonRegistered = context.ActionDescriptor.EndpointMetadata.Any(m => m is AllowNonRegisteredAttribute);
                
                var user = await dbContext.Users.FirstOrDefaultAsync(u =>
                    u.OAuthIssuer == oauthIss && u.OAuthSubject == oauthSub
                );

                if (allowNonRegistered) user ??= new User { OAuthIssuer = oauthIss, OAuthSubject = oauthSub };

                if (user == null)
                {
                    context.Result = new UnauthorizedResult();
                    return;
                }

                if (context.Controller is PennywizeControllerBase controller) controller.PennywizeUser = user;

                await next();
            }
        }
    }

    public class AllowNonRegisteredAttribute : Attribute { }
}