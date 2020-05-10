using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PennywizeServer.Models;

namespace PennywizeServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();
            DbInit(host);
            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration(conf => conf.AddEnvironmentVariables())
                .ConfigureWebHostDefaults(webBuilder => webBuilder.UseStartup<Startup>());

        public static void DbInit(IHost host)
        {
            using var scope = host.Services.CreateScope();
            scope
                .ServiceProvider
                .GetService<PennywizeContext>()
                .Database.Migrate();
        }
    }
}
