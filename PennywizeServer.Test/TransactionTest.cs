using System;
using Microsoft.EntityFrameworkCore;
using PennywizeServer.Models;
using PennywizeServer.Controllers;
using Xunit;
using System.Threading.Tasks;
using System.Linq;
using Xunit.Abstractions;

namespace PennywizeServer.Test
{
    public class TransactionTest : IClassFixture<PennywizeFixture>
    {
        DbContextOptions<PennywizeContext> options = new DbContextOptionsBuilder<PennywizeContext>().UseInMemoryDatabase("pnwz").Options;

        [Fact]
        public async Task GetTransactions_ShouldReturnAll()
        {
            using (var context = new PennywizeContext(options))
            {
                var controller = new TransactionsController(context);
                var transactions = (await controller.GetTransaction()).Value;

                Assert.True(transactions.Count() == 4);

                Assert.Collection(transactions.Select(t => t.Description), new Action<string>[]
                {
                    d => Assert.True(d == "giochi per bambini"),
                    d => Assert.True(d == "giochi per adulti"),
                    d => Assert.True(d == "spotify"),
                    d => Assert.True(d == "agosto")
                });

                Assert.Collection(transactions.Select(t => t.Amount), new Action<double>[]
                {
                    a => Assert.True(a == -50),
                    a => Assert.True(a == -500),
                    a => Assert.True(a == -15),
                    a => Assert.True(a == 1500)
                });
            }
        }

        [Fact]
        public async Task PostTransactions_ShouldInsertElement()
        {
            using (var context = new PennywizeContext(options))
            {
                var controller = new TransactionsController(context);
                await controller.PostTransaction(TestTransaction());

            }

            using (var context = new PennywizeContext(options))
            {
                var transactions = context.Transaction;

                Assert.True(transactions.Count() == 5);
                Assert.True(transactions.Any(t => t.Description == "tua mamma"));
                Assert.True(transactions.Any(t => t.Amount == 500));
            }
        }

        private Transaction TestTransaction() => new Transaction
        {
            Amount = 500,
            Date = DateTime.Now,
            Type = "benzina",
            Description = "tua mamma"
        };
    }
}
