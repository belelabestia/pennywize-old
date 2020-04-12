using System;
using Microsoft.EntityFrameworkCore;
using PennywizeServer.Models;
using PennywizeServer.Controllers;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using FluentAssertions;
using System.Collections.Generic;

namespace PennywizeServer.Test
{
    public class TransactionsTest
    {
        DbContextOptions<PennywizeContext> options = new DbContextOptionsBuilder<PennywizeContext>()
            .UseInMemoryDatabase("test_db")
            .Options;

        ControllerContext controllerContext;

        public TransactionsTest()
        {
            var claims = new Claim[] { new Claim("sub", "test_user") };
            var user = new ClaimsPrincipal(new ClaimsIdentity(claims));
            var httpContext = new DefaultHttpContext { User = user };

            controllerContext = new ControllerContext { HttpContext = httpContext };
        }

        [Fact]
        public async Task GetTransactions_ShouldGetUserTransactions()
        {
            await InitContext(new Transaction[]
            {
                new Transaction
                {
                    Amount = 1500,
                    Date = new DateTime(1000),
                    Type = "stipendio",
                    Description = "agosto",
                    UserId = "test_user"
                },
                new Transaction
                {
                    Amount = -100,
                    Date = new DateTime(1000),
                    Type = "spesa",
                    Description = "marzo",
                    UserId = "test_user"
                },
                new Transaction
                {
                    Amount = -15,
                    Date = new DateTime(1000),
                    Type = "abbonamenti",
                    Description = "spotify",
                    UserId = "wrong_user"
                }
            });

            var transactions = await UsingController(async controller => (await controller.GetTransactions()).Value);

            foreach (var t in transactions)
            {
                t.Id = null;
            }

            transactions
                .Should()
                .BeEquivalentTo(new Transaction[]
                {
                    new Transaction
                    {
                        Amount = 1500,
                        Date = new DateTime(1000),
                        Type = "stipendio",
                        Description = "agosto",
                        UserId = "test_user"
                    },
                    new Transaction
                    {
                        Amount = -100,
                        Date = new DateTime(1000),
                        Type = "spesa",
                        Description = "marzo",
                        UserId = "test_user"
                    }
                });
        }

        [Fact]
        public async Task GetTranslation_ShouldGetById()
        {
            await InitContext(new Transaction
            {
                Amount = -100,
                Date = new DateTime(1000),
                Type = "spesa",
                Description = "marzo",
                UserId = "test_user"
            });

            var id = await UsingContext(async context => (await context.Transactions.FirstAsync()).Id);
            var transaction = await UsingController(async controller => (await controller.GetTransaction(id)).Value);

            transaction
                .Should()
                .BeEquivalentTo(new Transaction
                {
                    Id = id,
                    Amount = -100,
                    Date = new DateTime(1000),
                    Type = "spesa",
                    Description = "marzo",
                    UserId = "test_user"
                });
        }

        [Fact]
        public async Task GetTransaction_ShouldForbid_IfWrongUser()
        {
            await InitContext(new Transaction
            {
                Amount = -15,
                Date = new DateTime(1000),
                Type = "abbonamenti",
                Description = "spotify",
                UserId = "wrong_user"
            });

            var id = await UsingContext(async context => (await context.Transactions.FirstAsync()).Id);
            var result = await UsingController(async controller => (await controller.GetTransaction(id)).Result);

            result
                .Should()
                .BeOfType<ForbidResult>();
        }

        [Theory]
        [InlineData("test_user")]
        [InlineData(null)]
        public async Task PostTransaction_ShouldInsertElement(string userId)
        {
            await InitContext();

            await UsingController(async controller => await controller.PostTransaction(new Transaction
            {
                Amount = -100,
                Date = new DateTime(1000),
                Type = "spesa",
                Description = "marzo",
                UserId = userId
            }));

            var transaction = await UsingContext(async context => await context.Transactions.FirstAsync());

            transaction.Id = null;

            transaction
                .Should()
                .NotBeNull()
                .And
                .BeEquivalentTo(new Transaction
                {
                    Amount = -100,
                    Date = new DateTime(1000),
                    Type = "spesa",
                    Description = "marzo",
                    UserId = "test_user"
                });
        }

        [Fact]
        public async Task PostTransaction_ShouldForbid_IfWrongUser()
        {
            await InitContext();

            var result = await UsingController(async controller => (await controller.PostTransaction(new Transaction
            {
                Amount = -100,
                Date = new DateTime(1000),
                Type = "spesa",
                Description = "marzo",
                UserId = "wrong_user"
            })).Result);

            result
                .Should()
                .BeOfType<ForbidResult>();
        }

        [Theory]
        [InlineData("test_user")]
        [InlineData(null)]
        public async Task PutTransaction_ShouldUpdateElement(string userId)
        {
            await InitContext(new Transaction[]
            {
                new Transaction
                {
                    Amount = -100,
                    Date = new DateTime(1000),
                    Type = "spesa",
                    Description = "marzo",
                    UserId = "test_user"
                },
                new Transaction
                {
                    Amount = 1500,
                    Date = new DateTime(1000),
                    Type = "stipendio",
                    Description = "aprile",
                    UserId = "test_user"
                }
            });

            var id = await UsingContext(async context => (await context.Transactions.FirstAsync()).Id);

            await UsingController(async controller => await controller.PutTransaction(id, new Transaction
            {
                Id = id,
                Amount = -150,
                Date = new DateTime(1000),
                Type = "spesa",
                Description = "marzo",
                UserId = userId
            }));

            var transaction = await UsingContext(async context => await context.Transactions.FirstAsync());

            transaction.Should().BeEquivalentTo(new Transaction
            {
                Id = id,
                Amount = -150,
                Date = new DateTime(1000),
                Type = "spesa",
                Description = "marzo",
                UserId = "test_user"
            });
        }

        [Theory]
        [InlineData("test_user")]
        [InlineData(null)]
        public async Task PutTransaction_ShouldForbid_IfWrongUser(string userId)
        {
            await InitContext(new Transaction[]
            {
                new Transaction
                {
                    Amount = -100,
                    Date = new DateTime(1000),
                    Type = "spesa",
                    Description = "marzo",
                    UserId = "other_user"
                },
                new Transaction
                {
                    Amount = 1500,
                    Date = new DateTime(1000),
                    Type = "stipendio",
                    Description = "aprile",
                    UserId = "test_user"
                }
            });

            var id = await UsingContext(async context => (await context.Transactions.FirstAsync()).Id);

            var result = await UsingController(async controller => await controller.PutTransaction(id, new Transaction
            {
                Id = id,
                Amount = -150,
                Date = new DateTime(1000),
                Type = "spesa",
                Description = "marzo",
                UserId = userId
            }));

            result
                .Should()
                .BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task PutTransaction_ShouldReturnBadRequest_IfUserIdMismatch()
        {
            await InitContext(new Transaction[]
            {
                new Transaction
                {
                    Amount = 1500,
                    Date = new DateTime(1000),
                    Type = "stipendio",
                    Description = "aprile",
                    UserId = "test_user"
                },
                new Transaction
                {
                    Amount = -100,
                    Date = new DateTime(1000),
                    Type = "spesa",
                    Description = "marzo",
                    UserId = "other_user"
                }
            });

            var id = await UsingContext(async context => (await context.Transactions.FirstAsync()).Id);

            var result = await UsingController(async controller => await controller.PutTransaction(id, new Transaction
            {
                Id = id,
                Amount = -150,
                Date = new DateTime(1000),
                Type = "spesa",
                Description = "marzo",
                UserId = "other_user"
            }));

            result
                .Should()
                .BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task DeleteTransaction_ShouldRemoveElement()
        {
            await InitContext(new Transaction[]
            {
                new Transaction
                {
                    Amount = 1500,
                    Date = new DateTime(1000),
                    Type = "stipendio",
                    Description = "aprile",
                    UserId = "test_user"
                },
                new Transaction
                {
                    Amount = -100,
                    Date = new DateTime(1000),
                    Type = "spesa",
                    Description = "marzo",
                    UserId = "test_user"
                }
            });

            var id = await UsingContext(async context => (await context.Transactions.FirstAsync()).Id);
            await UsingController(async controller => await controller.DeleteTransaction(id));

            var transactions = await UsingContext(async context => await context.Transactions.ToArrayAsync());

            foreach (var t in transactions)
            {
                t.Id = null;
            }

            transactions
                .Should()
                .HaveCount(1)
                .And
                .BeEquivalentTo(new Transaction[]
                {
                    new Transaction
                    {
                        Amount = -100,
                        Date = new DateTime(1000),
                        Type = "spesa",
                        Description = "marzo",
                        UserId = "test_user"
                    }
                });
        }

        [Fact]
        public async Task DeleteTransaction_ShouldForbid_IfWrongUser()
        {
            await InitContext(new Transaction
            {
                Amount = 1500,
                Date = new DateTime(1000),
                Type = "stipendio",
                Description = "aprile",
                UserId = "other_user"
            });

            var id = await UsingContext(async context => (await context.Transactions.FirstAsync()).Id);
            var result = await UsingController(async controller => (await controller.DeleteTransaction(id)).Result);

            result
                .Should()
                .BeOfType<ForbidResult>();
        }

        private async Task InitContext(IEnumerable<Transaction> transactions)
        {
            using var context = new PennywizeContext(options);
            await context.Database.EnsureDeletedAsync();

            await context.Transactions.AddRangeAsync(transactions);
            await context.SaveChangesAsync();
        }

        private async Task InitContext(Transaction transaction)
        {
            using var context = new PennywizeContext(options);
            await context.Database.EnsureDeletedAsync();

            await context.Transactions.AddAsync(transaction);
            await context.SaveChangesAsync();
        }

        private async Task InitContext()
        {
            using var context = new PennywizeContext(options);
            await context.Database.EnsureDeletedAsync();
        }

        private void UsingContext(Action<PennywizeContext> action)
        {
            using var context = new PennywizeContext(options);
            action(context);
        }

        private async Task UsingContext(Func<PennywizeContext, Task> action)
        {
            using var context = new PennywizeContext(options);
            await action(context);
        }

        private T UsingContext<T>(Func<PennywizeContext, T> func)
        {
            using var context = new PennywizeContext(options);
            return func(context);
        }

        private async Task<T> UsingContext<T>(Func<PennywizeContext, Task<T>> func)
        {
            using var context = new PennywizeContext(options);
            return await func(context);
        }

        private void UsingController(Action<TransactionsController> action)
        {
            using var context = new PennywizeContext(options);
            var controller = new TransactionsController(context);
            controller.ControllerContext = controllerContext;

            action(controller);
        }

        private async Task UsingController(Func<TransactionsController, Task> action)
        {
            using var context = new PennywizeContext(options);
            var controller = new TransactionsController(context);
            controller.ControllerContext = controllerContext;

            await action(controller);
        }

        private async Task<T> UsingController<T>(Func<TransactionsController, Task<T>> func)
        {
            using var context = new PennywizeContext(options);
            var controller = new TransactionsController(context);
            controller.ControllerContext = controllerContext;

            return await func(controller);
        }
    }
}
