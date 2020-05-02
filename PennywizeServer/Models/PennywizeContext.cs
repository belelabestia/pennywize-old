using Microsoft.EntityFrameworkCore;

namespace PennywizeServer.Models
{
    public partial class PennywizeContext : DbContext
    {
        public PennywizeContext() { }
        public PennywizeContext(DbContextOptions<PennywizeContext> options) : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured) optionsBuilder.UseSqlite("Data source=pennywize.db");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder) => OnModelCreatingPartial(modelBuilder);
        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<User> Users { get; set; }
    }
}
