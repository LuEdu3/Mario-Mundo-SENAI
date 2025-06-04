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
        public async Task<IActionResult> GetTop3()
        {
            // Seleciona a maior pontuação de cada jogador
            var top3 = await _context.Pontuacoes
                .Include(p => p.Player)
                .GroupBy(p => p.PlayerId)
                .Select(g => g.OrderByDescending(p => p.Pontos).First())
                .OrderByDescending(p => p.Pontos)
                .Take(3)
                .Select(p => new { nome = p.Player != null ? p.Player.Nome : string.Empty, pontos = p.Pontos })
                .ToListAsync();
            return Ok(top3);
        }

        [HttpPost]
        public async Task<IActionResult> PostPontuacao([FromBody] Pontuacao pontuacao)
        {
            // Garante que o nome não é nulo
            var nome = pontuacao.Player != null ? pontuacao.Player.Nome : string.Empty;
            if (string.IsNullOrWhiteSpace(nome))
                return BadRequest("Nome do jogador é obrigatório.");
            int pontos = pontuacao.Pontos;
            // Busca ou cria o jogador
            var player = await _context.Players.FirstOrDefaultAsync(p => p.Nome == nome);
            if (player == null)
            {
                player = new MarioMundoSenai.Models.Player { Nome = nome };
                _context.Players.Add(player);
                await _context.SaveChangesAsync();
            }
            // Salva a pontuação
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
