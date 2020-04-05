using System;
using Microsoft.EntityFrameworkCore;
using PennywizeServer.Models;
using PennywizeServer.Controllers;
using Xunit;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace PennywizeServer.Test
{
    public class TransactionTest
    {
        DbContextOptions<PennywizeContext> options;
        const string testUserId = "test_user_id";

        public TransactionTest() => SetUpContext();

        [Fact]
        public void GetTransactions_ShouldGetAll()
        {
            var transactions0 = default(IEnumerable<Transaction>);
            var transactions1 = default(IEnumerable<Transaction>);

            UsingController(controller => transactions0 = controller.GetTransactions().Result.Value);
            UsingContext(context => transactions1 = context.Transactions.Where(t => t.UserId == testUserId).ToArray());

            Assert.True(transactions1.Count() == 3);
            Assert.All(transactions0.Zip(transactions1), tt => Assert.True(
                tt.First.Description == tt.Second.Description &&
                tt.First.Amount == tt.Second.Amount
            ));
        }

        [Fact]
        public void GetTranslation_ShouldGetById()
        {            
            var transaction0 = default(Transaction);
            var transaction1 = default(Transaction);

            UsingContext(context => transaction0 = context.Transactions.First());
            UsingController(controller => transaction1 = controller.GetTransaction(transaction0.Id).Result.Value);

            Assert.True(
                transaction1.Amount == transaction0.Amount &&
                transaction1.Date == transaction0.Date &&
                transaction1.Type == transaction0.Type &&
                transaction1.Description == transaction0.Description
            );
        }

        [Fact]
        public void PostTransaction_ShouldInsertElement()
        {
            var transactions = default(IEnumerable<Transaction>);
            var transaction = TestTransaction();

            UsingController(controller => controller.PostTransaction(transaction).Wait());
            UsingContext(context => transactions = context.Transactions.Where(t => t.UserId == testUserId).ToArray());

            Assert.True(
                transactions.Count() == 4 &&
                transactions.Any(t =>
                    t.Description == transaction.Description &&
                    t.Amount == transaction.Amount &&
                    t.UserId == testUserId
                )
            );
        }

        [Fact]
        public void PutTransaction_ShouldUpdateElement()
        {
            var transaction0 = TestTransaction();
            var transaction1 = default(Transaction);

            UsingContext(context => transaction0.Id = context.Transactions.First().Id);
            UsingController(controller => controller.PutTransaction(transaction0.Id, transaction0).Wait());
            UsingContext(context => transaction1 = context.Transactions.Find(transaction0.Id));

            Assert.True(
                transaction1.Amount == transaction0.Amount &&
                transaction1.Type == transaction0.Type &&
                transaction1.Description == transaction0.Description
            );
        }

        [Fact]
        public void DeleteTransaction_ShouldRemoveElement()
        {
            var transaction0 = default(Transaction);
            var transaction1 = default(Transaction);

            UsingContext(context => transaction0 = context.Transactions.First());
            UsingController(controller => controller.DeleteTransaction(transaction0.Id).Wait());
            UsingContext(context => transaction1 = context.Transactions.Find(transaction0.Id));

            Assert.Null(transaction1);
        }
        
        private Transaction TestTransaction() => new Transaction
        {
            Amount = 500,
            Date = DateTime.Now,
            Type = "benzina",
            Description = "tua mamma"
        };

        private void UsingContext(Action<PennywizeContext> action)
        {
            using (var context = new PennywizeContext(options))
            {
                action(context);
            }
        }

        private void UsingController(Action<TransactionsController> action) =>
            UsingContext(context => {
                var controller = new TransactionsController(context);
                controller.ControllerContext = GetControllerContext();
                action(controller);
            });

        private void SetUpContext()
        {
            options = new DbContextOptionsBuilder<PennywizeContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            UsingContext(context =>
            {
                context.Database.EnsureDeleted();

                context.Transactions.Add(new Transaction
                {
                    Amount = -50,
                    Date = DateTime.Now,
                    Type = "svago",
                    Description = "giochi per bambini",
                    UserId = testUserId
                });

                context.Transactions.Add(new Transaction
                {
                    Amount = -500,
                    Date = DateTime.Now,
                    Type = "svago",
                    Description = "giochi per adulti",
                    UserId = "some_other_user_id"
                });

                context.Transactions.Add(new Transaction
                {
                    Amount = -15,
                    Date = DateTime.Now,
                    Type = "abbonamenti",
                    Description = "spotify",
                    UserId = testUserId
                });

                context.Transactions.Add(new Transaction
                {
                    Amount = 1500,
                    Date = DateTime.Now,
                    Type = "stipendio",
                    Description = "agosto",
                    UserId = testUserId
                });

                context.SaveChanges();
            });
        }

        private ControllerContext GetControllerContext()
        {
            var claims = new Claim[] { new Claim("sub", testUserId) };
            var user = new ClaimsPrincipal(new ClaimsIdentity(claims));
            var httpContext = new DefaultHttpContext { User = user };

            return new ControllerContext { HttpContext = httpContext };
        }
    }
}
