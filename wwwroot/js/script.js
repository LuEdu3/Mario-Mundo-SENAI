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
    const ol = document.querySelector('.leaderboard ol');
    ol.innerHTML = '';
    data.forEach((item, idx) => {
        let medalha = '';
        if (idx === 0) medalha = '<span class="gold">1º</span>';
        else if (idx === 1) medalha = '<span class="silver">2º</span>';
        else if (idx === 2) medalha = '<span class="bronze">3º</span>';
        ol.innerHTML += `<li>${medalha} ${item.nome} - ${item.pontos}</li>`;
    });
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
