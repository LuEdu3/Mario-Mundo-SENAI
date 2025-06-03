using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarioMundoSenai.Models
{
    [Table("player", Schema = "Mario_mundo_senai")]
    public class Player
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
    }
}
