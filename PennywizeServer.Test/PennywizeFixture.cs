using System;
using Microsoft.EntityFrameworkCore;
using PennywizeServer.Models;

namespace PennywizeServer.Test
{
    public class PennywizeFixture : IDisposable
    {
        DbContextOptions<PennywizeContext> options = new DbContextOptionsBuilder<PennywizeContext>().UseInMemoryDatabase("pnwz").Options;

        public PennywizeFixture() => SetUpContext();
        public void Dispose() => ClearContext();

        private void SetUpContext()
        {
            using (var context = new PennywizeContext(options))
            {
                context.Add(new Transaction
                {
                    Amount = -50,
                    Date = DateTime.Now,
                    Type = "svago",
                    Description = "giochi per bambini"
                });

                context.Add(new Transaction
                {
                    Amount = -500,
                    Date = DateTime.Now,
                    Type = "svago",
                    Description = "giochi per adulti"
                });

                context.Add(new Transaction
                {
                    Amount = -15,
                    Date = DateTime.Now,
                    Type = "abbonamenti",
                    Description = "spotify"
                });

                context.Add(new Transaction
                {
                    Amount = 1500,
                    Date = DateTime.Now,
                    Type = "stipendio",
                    Description = "agosto"
                });

                context.SaveChanges();
            }
        }

        private void ClearContext()
        {
            using (var context = new PennywizeContext(options))
            {
                context.Transaction.RemoveRange(context.Transaction);
            }
        }
    }
}