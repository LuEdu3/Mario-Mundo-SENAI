using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MarioMundoSenai.Data;
using MarioMundoSenai.Models;
using System.Linq;
using System.Threading.Tasks;

namespace MarioMundoSenai.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaderboardController : ControllerBase
    {
        private readonly MarioContext _context;
        public LeaderboardController(MarioContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetTop3()
        {
            var top3 = _context.Pontuacoes
                .Include(p => p.Player)
                .AsEnumerable()
                .GroupBy(p => p.PlayerId)
                .Select(g => g.OrderByDescending(e => e.Pontos).First())
                .OrderByDescending(e => e.Pontos)
                .Take(3)
                .Select(p => new { nome = p.Player != null ? p.Player.Nome : string.Empty, pontos = p.Pontos })
                .ToList();
            return Ok(top3);
        }

        [HttpPost]
        public async Task<IActionResult> PostPontuacao([FromBody] Pontuacao pontuacao)
        {
            var nome = pontuacao.Player != null ? pontuacao.Player.Nome : string.Empty;
            if (string.IsNullOrWhiteSpace(nome))
                return BadRequest("Nome do jogador é obrigatório.");
            int pontos = pontuacao.Pontos;
            var player = await _context.Players.FirstOrDefaultAsync(p => p.Nome == nome);
            if (player == null)
            {
                player = new MarioMundoSenai.Models.Player { Nome = nome };
                _context.Players.Add(player);
                await _context.SaveChangesAsync();
            }
            var novaPontuacao = new MarioMundoSenai.Models.Pontuacao
            {
                Pontos = pontos,
                PlayerId = player.Id
            };
            _context.Pontuacoes.Add(novaPontuacao);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
