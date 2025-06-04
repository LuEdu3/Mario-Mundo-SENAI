const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const clouds = document.querySelector('.clouds'); // caso tenha clouds no HTML

let score = 0;
let canScore = true;

// Impede o jogo de começar antes do nome
let gameStarted = false;
let loop;

// Tela de nome do usuário
const userFormOverlay = document.querySelector('.user-form-overlay');
const userForm = document.querySelector('.user-form');
const usernameInput = document.getElementById('username');
let playerName = '';

// Flag para evitar múltiplos game over
let gameOverFlag = false;

userForm.addEventListener('submit', function (e) {
    e.preventDefault();
    playerName = usernameInput.value.trim();
    if (playerName.length > 0) {
        userFormOverlay.classList.remove('active');
        gameStarted = true;
        gameOverFlag = false;
        // Inicia o loop do jogo só após o nome ser confirmado
        loop = setInterval(gameLoop, 10);
    } else {
        usernameInput.focus();
    }
});

// Função para enviar a pontuação ao backend
async function enviarPontuacao(nome, pontos) {
    await fetch('/api/Leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pontos: pontos,
            player: { nome: nome }
        })
    });
}

// Função para atualizar o leaderboard
async function atualizarLeaderboard() {
    const resp = await fetch('/api/Leaderboard');
    const data = await resp.json();

    // Atualiza o pódio visual
    const podium1Name = document.getElementById('podium-1-name');
    const podium1Score = document.getElementById('podium-1-score');
    const podium2Name = document.getElementById('podium-2-name');
    const podium2Score = document.getElementById('podium-2-score');
    const podium3Name = document.getElementById('podium-3-name');
    const podium3Score = document.getElementById('podium-3-score');

    if (podium1Name && podium1Score) {
        podium1Name.textContent = data[0]?.nome || '';
        podium1Score.textContent = data[0]?.pontos !== undefined ? data[0].pontos : '';
    }
    if (podium2Name && podium2Score) {
        podium2Name.textContent = data[1]?.nome || '';
        podium2Score.textContent = data[1]?.pontos !== undefined ? data[1].pontos : '';
    }
    if (podium3Name && podium3Score) {
        podium3Name.textContent = data[2]?.nome || '';
        podium3Score.textContent = data[2]?.pontos !== undefined ? data[2].pontos : '';
    }

    // (Opcional) Atualiza lista antiga, se ainda existir
    const ol = document.querySelector('.leaderboard ol');
    if (ol) {
        ol.innerHTML = '';
        data.forEach((item, idx) => {
            let medalha = '';
            if (idx === 0) medalha = '<span class="gold">1º</span>';
            else if (idx === 1) medalha = '<span class="silver">2º</span>';
            else if (idx === 2) medalha = '<span class="bronze">3º</span>';
            ol.innerHTML += `<li>${medalha} ${item.nome} - ${item.pontos}</li>`;
        });
    }
}

// Função do loop do jogo
function gameLoop() {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
    // Pontuação: se o pipe passou do Mario e não houve colisão
    if (pipePosition < 50 && pipePosition > 0 && canScore) {
        score++;
        updateScore();
        canScore = false;
        setTimeout(() => canScore = true, 1200);
    }
    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
        // Garante que só executa o game over uma vez
        if (!gameOverFlag) {
            gameOverFlag = true;
            pipe.style.animation = 'none';
            pipe.style.left = `${pipePosition}px`;
            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;
            mario.src = '../img/game-over.png';
            mario.style.width = '75px';
            mario.style.marginLeft = '50px';
            if (clouds) {
                clouds.style.animation = 'none';
            }
            const gameOver = document.querySelector('.game-over');
            if (gameOver) gameOver.classList.add('active');
            enviarPontuacao(playerName, score).then(atualizarLeaderboard);
            // Após o game over, zera o score para a próxima rodada
            score = 0;
            updateScore();
            clearInterval(loop);
        }
    }
}

const jump = () => {
    if (!gameStarted) return;
    mario.classList.add('jump');

    setTimeout(() => {
        mario.classList.remove('jump');
    }, 600);
}

const updateScore = () => {
    document.querySelector('.score').textContent = score;
};

document.addEventListener('keydown', jump);

// Atualiza leaderboard ao carregar
atualizarLeaderboard();
