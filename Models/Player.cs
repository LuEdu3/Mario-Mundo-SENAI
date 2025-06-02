using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarioMundoSenai.Models
{
    [Table("player", Schema = "Mario_mundo_senai")]
    public class Player
    {
        [Key]
        public int Id { get; set; }
        public string Nome { get; set; }
        public ICollection<Pontuacao> Pontuacoes { get; set; }
    }

    [Table("pontuacao", Schema = "Mario_mundo_senai")]
    public class Pontuacao
    {
        [Key]
        public int Id { get; set; }
        public int Pontos { get; set; }
        [Column("player_id")]
        public int PlayerId { get; set; }
        [ForeignKey("PlayerId")]
        public Player Player { get; set; }
    }
}
