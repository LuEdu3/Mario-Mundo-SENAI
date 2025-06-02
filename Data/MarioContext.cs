using Microsoft.EntityFrameworkCore;
using MarioMundoSenai.Models;

namespace MarioMundoSenai.Data
{
    public class MarioContext : DbContext
    {
        public MarioContext(DbContextOptions<MarioContext> options) : base(options) { }

        public DbSet<Player> Players { get; set; }
        public DbSet<Pontuacao> Pontuacoes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
