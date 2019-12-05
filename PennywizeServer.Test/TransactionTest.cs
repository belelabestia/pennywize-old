using System;
using Microsoft.EntityFrameworkCore;
using PennywizeServer.Models;
using PennywizeServer.Controllers;
using Xunit;
using System.Threading.Tasks;
using System.Linq;
using Xunit.Abstractions;
using System.Collections.Generic;

namespace PennywizeServer.Test
{
    public class TransactionTest : IClassFixture<PennywizeFixture>
    {
        DbContextOptions<PennywizeContext> options = new DbContextOptionsBuilder<PennywizeContext>().UseInMemoryDatabase("pnwz").Options;

        [Fact]
        public async Task GetTransactions_ShouldReturnAll()
        {
            IEnumerable<Transaction> transactions0 = new Transaction[0];

            await Using(async (context, controller) =>
            {
                transactions0 = (await controller.GetTransaction()).Value;
            });

            Using((context, controller) =>
            {
                var transactions1 = context.Transaction;

                Assert.True(transactions1.Count() == 4);

                Assert.All(transactions0.Zip(transactions1), tt => Assert.True(tt.First.Description == tt.Second.Description));

                Assert.Collection(transactions1.Select(t => t.Amount), new Action<double>[]
                {
                    a => Assert.True(a == -50),
                    a => Assert.True(a == -500),
                    a => Assert.True(a == -15),
                    a => Assert.True(a == 1500)
                });
            });
        }

        [Fact]
        public async Task GetTranslation_ShouldReturnById()
        {
            var transaction0 = new Transaction();

            Using((context, controller) =>
            {
                transaction0 = context.Transaction.First();
            });

            await Using(async (context, controller) =>
            {
                var transaction1 = (await controller.GetTransaction(transaction0.Id)).Value;

                Assert.True(
                    transaction1.Amount == transaction0.Amount &&
                    transaction1.Date == transaction0.Date &&
                    transaction1.Type == transaction0.Type &&
                    transaction1.Description == transaction0.Description
                );
            });
        }

        [Fact]
        public async Task PostTransaction_ShouldInsertElement()
        {
            await Using(async (context, controller) =>
            {
                await controller.PostTransaction(TestTransaction());
            });

            await Using(async (context, controller) => await Task.Run(() =>
            {
                var transactions = context.Transaction;
                var test = TestTransaction();

                Assert.True(
                    transactions.Count() == 5 &&
                    transactions.Any(t => 
                        t.Description == test.Description &&
                        t.Amount == test.Amount
                    )
                );
            }));
        }

        [Fact]
        public async Task PutTransaction_ShouldUpdateElement()
        {
            var transaction0 = new Transaction();
            var suffix = " - Changed";

            await Using(async (context, controller) =>
            {
                transaction0 = context.Transaction.First();

                transaction0.Amount += 10;
                transaction0.Description += suffix;

                await controller.PutTransaction(transaction0.Id, transaction0);
            });

            await Using(async (context, controller) =>
            {
                var transaction1 = await context.Transaction.FindAsync(transaction0.Id);

                Assert.True(
                    transaction1.Id == transaction0.Id &&
                    transaction1.Amount == transaction0.Amount &&
                    transaction1.Description == transaction0.Description
                );
            });
        }

        private Transaction TestTransaction() => new Transaction
        {
            Amount = 500,
            Date = DateTime.Now,
            Type = "benzina",
            Description = "tua mamma"
        };

        private async Task Using(Func<PennywizeContext, TransactionsController, Task> action)
        {
            using (var context = new PennywizeContext(options))
            {
                var controller = new TransactionsController(context);
                await action(context, controller);
            }
        }

        private void Using(Action<PennywizeContext, TransactionsController> action)
        {
            using (var context = new PennywizeContext(options))
            {
                var controller = new TransactionsController(context);
                action(context, controller);
            }
        }
    }
}
