const mario = document.querySelector('.mario');
const clouds = document.querySelector('.clouds'); // caso tenha clouds no HTML
const gameBoard = document.querySelector('.game-board');

let score = 0;
let canScore = true;
let gameStarted = false;
let gameOverFlag = false;
let isJumping = false;
let animationFrameId = null;
let canCollide = false; // novo controle para colisão

const userFormOverlay = document.querySelector('.user-form-overlay');
const userForm = document.querySelector('.user-form');
const usernameInput = document.getElementById('username');
let playerName = '';

const gameOverScreen = document.querySelector('.game-over');
const scoreDiv = document.querySelector('.score');
const pipe = document.querySelector('.pipe');

// Função para resetar o jogo
function resetGame() {
    score = 0;
    canScore = false; // só libera pontuação após delay
    canCollide = false; // só libera colisão após delay
    gameOverFlag = false;
    isJumping = false;
    updateScore();
    mario.src = 'img/mario.gif';
    mario.style.width = '150px';
    mario.style.bottom = '0px';
    mario.classList.remove('jump');
    // Reinicia a animação do cano corretamente para evitar morte injusta ao iniciar
    pipe.style.animation = 'none';
    pipe.offsetHeight; // força reflow
    pipe.style.animation = 'pipe-animation 2s infinite linear';
    mario.style.animation = '';
    gameOverScreen.classList.remove('active');
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
    // Libera pontuação e colisão só após 1s
    setTimeout(() => {
        canScore = true;
        canCollide = true;
    }, 1000);
}

// Função de pulo
function jump() {
    if (!gameStarted || gameOverFlag || isJumping) return;
    isJumping = true;
    mario.classList.add('jump');    setTimeout(() => {
        mario.classList.remove('jump');
        isJumping = false;
    }, 1000); // Aumentei a duração do pulo de 600ms para 1000ms
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        // Só pula se não estiver em game over
        if (!gameOverFlag) {
            jump();
            if (!gameStarted && !userFormOverlay.classList.contains('active')) {
                startGame();
            }
        }
    }
    // Só permite resetar com ENTER
    if (gameOverFlag && e.code === 'Enter') {
        resetGame();
    }
});

// Função para atualizar o score visual
function updateScore() {
    if (scoreDiv) scoreDiv.textContent = score;
}

// Função principal do loop do jogo
function gameLoop() {
    const pipePosition = parseInt(window.getComputedStyle(pipe).right.replace('px', ''));
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
    const marioWidth = parseInt(window.getComputedStyle(mario).width);
    const pipeWidth = parseInt(window.getComputedStyle(pipe).width);

    // Score: se o cano passou do Mario e não houve colisão
    if (pipePosition < 30 && pipePosition > -30 && canScore && !gameOverFlag) {
        score++;
        updateScore();
        canScore = false;
        setTimeout(() => canScore = true, 1200);
    }

    // Debug: mostra posições quando está próximo de uma colisão
    if (canCollide && pipePosition <= 30 && pipePosition >= 0) {
        console.log(`Debug - Pipe: ${pipePosition}px, Mario: ${marioPosition}px, Mario Width: ${marioWidth}px, Pipe Width: ${pipeWidth}px`);
    }

    // --- NOVA LÓGICA DE COLISÃO USANDO BOUNDING BOX ---
    if (canCollide && !gameOverFlag) {
        const marioRect = mario.getBoundingClientRect();
        const pipeRect = pipe.getBoundingClientRect();
        // Verifica se há sobreposição real
        const overlap = (
            marioRect.right > pipeRect.left &&
            marioRect.left < pipeRect.right &&
            marioRect.bottom > pipeRect.top &&
            marioRect.top < pipeRect.bottom
        );
        if (overlap) {
            console.log('COLISÃO DETECTADA (precisa)!');
            console.log(`Mario: left ${marioRect.left}, right ${marioRect.right}, top ${marioRect.top}, bottom ${marioRect.bottom}`);
            console.log(`Pipe: left ${pipeRect.left}, right ${pipeRect.right}, top ${pipeRect.top}, bottom ${pipeRect.bottom}`);
            gameOver();
            return;
        }
    }
    // --- FIM DA NOVA LÓGICA ---

    animationFrameId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameOverFlag = true;
    pipe.style.animation = 'none';
    mario.style.animation = 'none';
    mario.style.bottom = window.getComputedStyle(mario).bottom;
    mario.src = 'img/game-over.png';
    mario.style.width = '75px';
    gameOverScreen.classList.add('active');
    enviarPontuacao(playerName, score).then(atualizarLeaderboard);
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    resetGame();
}

userForm.addEventListener('submit', function (e) {
    e.preventDefault();
    playerName = usernameInput.value.trim();
    if (playerName.length > 0) {
        userFormOverlay.classList.remove('active');
        startGame();
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

// Atualiza leaderboard ao carregar
atualizarLeaderboard();
