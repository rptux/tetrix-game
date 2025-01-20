



document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const larguraBloco = 30;
    const larguraJogo = canvas.width / larguraBloco;
    const alturaJogo = canvas.height / larguraBloco;

    const cores = [
        '#000', // Preto
        '#FF0000', // Vermelho
        '#00FF00', // Verde
        '#0000FF', // Azul
        '#FFFF00', // Amarelo
        '#FFA500', // Laranja
        '#800080'  // Roxo
    ];

    const formas = [
        [[1, 1, 1, 1]],
        [[1, 1], [1, 1]],
        [[0, 1, 0], [1, 1, 1]],
        [[1, 0, 0], [1, 1, 1]],
        [[0, 0, 1], [1, 1, 1]],
        [[1, 1, 0], [0, 1, 1]],
        [[0, 1, 1], [1, 1, 0]]
    ];

    function rotacionar(peca) {
        return peca[0].map((_, i) => peca.map(linha => linha[i]).reverse());
    }

    function colisao(tabuleiro, peca, offset) {
        const [offX, offY] = offset;
        for (let y = 0; y < peca.length; y++) {
            for (let x = 0; x < peca[y].length; x++) {
                if (peca[y][x] && 
                    (tabuleiro[y + offY] && tabuleiro[y + offY][x + offX]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function desenharGrade() {
        ctx.strokeStyle = '#888';
        for (let i = 0; i < canvas.width; i += larguraBloco) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let j = 0; j < canvas.height; j += larguraBloco) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
            ctx.stroke();
        }
    }

    function desenharPeca(peca, offset, cor) {
        const [offX, offY] = offset;
        for (let y = 0; y < peca.length; y++) {
            for (let x = 0; x < peca[y].length; x++) {
                if (peca[y][x]) {
                    ctx.fillStyle = cor;
                    ctx.fillRect((offX + x) * larguraBloco, (offY + y) * larguraBloco, larguraBloco, larguraBloco);
                }
            }
        }
    }

    function desenharTabuleiro(tabuleiro) {
        for (let y = 0; y < tabuleiro.length; y++) {
            for (let x = 0; x < tabuleiro[y].length; x++) {
                if (tabuleiro[y][x]) {
                    ctx.fillStyle = cores[tabuleiro[y][x]];
                    ctx.fillRect(x * larguraBloco, y * larguraBloco, larguraBloco, larguraBloco);
                }
            }
        }
    }

    function novoTabuleiro() {
        return Array.from({ length: alturaJogo }, () => Array(larguraJogo).fill(0));
    }

    function limparLinhas(tabuleiro) {
        let linhasCompletas = 0;
        for (let y = tabuleiro.length - 1; y >= 0; y--) {
            if (tabuleiro[y].every(valor => valor !== 0)) {
                tabuleiro.splice(y, 1);
                tabuleiro.unshift(Array(larguraJogo).fill(0));
                linhasCompletas++;
            }
        }
        return linhasCompletas;
    }

    function main() {
        const tabuleiro = novoTabuleiro();
        let peca = formas[Math.floor(Math.random() * formas.length)];
        let corPeca = cores[Math.floor(Math.random() * (cores.length - 1)) + 1];
        let posicao = [Math.floor(larguraJogo / 2) - 1, 0];
        let score = 0;
        let ultimoTempoAtualizacao = 0;
        let intervaloQueda = 1000; // Intervalo em milissegundos (1 segundo)
        let jogoRodando = false;

        function atualizar(timestamp) {
            if (!ultimoTempoAtualizacao) ultimoTempoAtualizacao = timestamp;
            const progresso = timestamp - ultimoTempoAtualizacao;

            if (progresso > intervaloQueda && jogoRodando) {
                posicao[1]++;

                if (colisao(tabuleiro, peca, posicao)) {
                    posicao[1]--;
                    peca.forEach((linha, y) => {
                        linha.forEach((valor, x) => {
                            if (valor) {
                                tabuleiro[y + posicao[1]][x + posicao[0]] = cores.indexOf(corPeca);
                            }
                        });
                    });

                    score += limparLinhas(tabuleiro) * 100;
                    peca = formas[Math.floor(Math.random() * formas.length)];
                    corPeca = cores[Math.floor(Math.random() * (cores.length - 1)) + 1];
                    posicao = [Math.floor(larguraJogo / 2) - 1, 0];

                    if (colisao(tabuleiro, peca, posicao)) {
                        alert('Game Over');
                        jogoRodando = false;
                        return;
                    }
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                desenharGrade();
                desenharPeca(peca, posicao, corPeca);
                desenharTabuleiro(tabuleiro);

                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.fillText(`Pontuação: ${score}`, 10, 20);

                ultimoTempoAtualizacao = timestamp;
            }

            requestAnimationFrame(atualizar);
        }

        requestAnimationFrame(atualizar);

        startButton.addEventListener('click', () => {
            jogoRodando = true;
            startButton.style.display = 'none';
        });

        document.addEventListener('keydown', (event) => {
            if (jogoRodando) {
                if (event.key === 'ArrowLeft') {
                    const novaPosicao = [posicao[0] - 1, posicao[1]];
                    if (!colisao(tabuleiro, peca, novaPosicao)) {
                        posicao = novaPosicao;
                    }
                } else if (event.key === 'ArrowRight') {
                    const novaPosicao = [posicao[0] + 1, posicao[1]];
                    if (!colisao(tabuleiro, peca, novaPosicao)) {
                        posicao = novaPosicao;
                    }
                } else if (event.key === 'ArrowDown') {
                    const novaPosicao = [posicao[0], posicao[1] + 1];
                    if (!colisao(tabuleiro, peca, novaPosicao)) {
                        posicao = novaPosicao;
                    }
                } else if (event.key === 'ArrowUp') {
                    const novaPeca = rotacionar(peca);
                    if (!colisao(tabuleiro, novaPeca, posicao)) {
                        peca = novaPeca;
                    }
                }
            }
        });
    }

    main();
});
