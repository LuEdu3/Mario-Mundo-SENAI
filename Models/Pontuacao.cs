using System.ComponentModel.DataAnnotations.Schema;
using MarioMundoSenai.Models;

namespace MarioMundoSenai.Models
{
    public class Pontuacao
    {
        public int Id { get; set; }

        [Column("pontos")]
        public int Pontos { get; set; }

        [Column("player_id")]
        public int PlayerId { get; set; }

        public Player? Player { get; set; }
    }
}