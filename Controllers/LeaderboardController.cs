using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MarioMundoSenai.Data;
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
            var top3 = await _context.Pontuacoes
                .Include(p => p.Player)
                .OrderByDescending(p => p.Pontos)
                .Take(3)
                .Select(p => new { nome = p.Player.Nome, pontos = p.Pontos })
                .ToListAsync();
            return Ok(top3);
        }
    }
}
