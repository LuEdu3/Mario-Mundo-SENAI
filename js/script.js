const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const clouds = document.querySelector('.clouds'); // caso tenha clouds no HTML

let score = 0;
let canScore = true;

const jump = () => {
    mario.classList.add('jump');

    setTimeout(() => {
        mario.classList.remove('jump');
    }, 600);
}

const updateScore = () => {
    document.querySelector('.score').textContent = score;
};

const loop = setInterval(() => {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
    // Se tiver clouds:
    // const cloudsPosition = clouds ? clouds.offsetLeft : 0;

    // Pontuação: se o pipe passou do Mario e não houve colisão
    if (pipePosition < 50 && pipePosition > 0 && canScore) {
        score++;
        updateScore();
        canScore = false;
        setTimeout(() => canScore = true, 1200); // evita múltiplos pontos por pipe
    }

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;
        mario.src = './img/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';

        // Se tiver clouds:
        if (clouds) {
            clouds.style.animation = 'none';
        }

        // Mostra a tela de Game Over
        const gameOver = document.querySelector('.game-over');
        if (gameOver) gameOver.style.display = 'flex';

        clearInterval(loop);
    }
}, 10);

document.addEventListener('keydown', jump);
