// game.js
document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы DOM
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const finalScoreElement = document.getElementById('finalScore');
    const gameMenu = document.getElementById('gameMenu');
    const gameOver = document.getElementById('gameOver');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');

    // Константы игры
    const PLAYER_WIDTH = 40;
    const PLAYER_HEIGHT = 40;
    const PLATFORM_WIDTH = 60;
    const PLATFORM_HEIGHT = 15;
    const GRAVITY = 0.1;
    const JUMP_FORCE = -8;
    const PLATFORM_COUNT = 7;
    const PLAYER_SPEED = 3; // Уменьшено с 5 до 3 для менее чувствительного управления

    // Состояние игры
    let gameRunning = false;
    let player = {
        x: canvas.width / 2 - PLAYER_WIDTH / 2,
        y: canvas.height - PLAYER_HEIGHT - 100,
        velocityY: 0,
        jumping: false,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
    };

    let platforms = [];
    let score = 0;
    let highScore = localStorage.getItem('doodleHighScore') || 0;
    highScoreElement.textContent = highScore;
    let scrollOffset = 0;
    let gameLoopId = null; // Добавляем ID для отслеживания и отмены gameLoop

    // Инициализация игры
    function init() {
        // Создаем начальные платформы
        platforms = [];
        
        // Создаем стартовую платформу прямо под игроком для безопасного спавна
        const startPlatform = {
            x: canvas.width / 2 - PLATFORM_WIDTH / 2,
            y: canvas.height - 50,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT
        };
        platforms.push(startPlatform);
        
        // Позиционируем игрока прямо над стартовой платформой
        player = {
            x: startPlatform.x + (PLATFORM_WIDTH / 2) - (PLAYER_WIDTH / 2),
            y: startPlatform.y - PLAYER_HEIGHT,
            velocityY: 0,
            jumping: false,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT
        };

        // Создаем остальные платформы
        for (let i = 1; i < PLATFORM_COUNT; i++) {
            platforms.push({
                x: Math.random() * (canvas.width - PLATFORM_WIDTH),
                y: canvas.height - (i * 80) - 50,
                width: PLATFORM_WIDTH,
                height: PLATFORM_HEIGHT
            });
        }
        
        score = 0;
        scoreElement.textContent = score;
        scrollOffset = 0;
    }

    // Обработка ввода с клавиатуры
    let keysPressed = {
        left: false,
        right: false
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') keysPressed.left = true;
        if (e.key === 'ArrowRight') keysPressed.right = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') keysPressed.left = false;
        if (e.key === 'ArrowRight') keysPressed.right = false;
    });

    // Обновление игры
    function update() {
        if (!gameRunning) return;

        // Физика игрока
        player.velocityY += GRAVITY;
        player.y += player.velocityY;

        // Горизонтальное движение игрока
        if (keysPressed.left) {
            player.x -= PLAYER_SPEED;
        }
        if (keysPressed.right) {
            player.x += PLAYER_SPEED;
        }

        // Обертывание экрана по горизонтали (телепортация сторон)
        if (player.x > canvas.width) {
            player.x = 0;
        } else if (player.x + player.width < 0) {
            player.x = canvas.width;
        }

        // Проверка столкновений с платформами
        if (player.velocityY > 0) { // Проверяем только при падении
            for (let i = 0; i < platforms.length; i++) {
                const platform = platforms[i];
                if (
                    player.x + player.width > platform.x &&
                    player.x < platform.x + platform.width &&
                    player.y + player.height > platform.y &&
                    player.y + player.height < platform.y + platform.height &&
                    player.velocityY > 0
                ) {
                    player.jumping = false;
                    player.velocityY = JUMP_FORCE;
                }
            }
        }

        // Прокручивание экрана, когда игрок поднимается выше
        const maxHeight = canvas.height / 2 - 100;
        if (player.y < maxHeight) {
            const scrollAmount = maxHeight - player.y;
            scrollOffset += scrollAmount;
            player.y = maxHeight;

            // Передвигаем все платформы вниз
            for (let i = 0; i < platforms.length; i++) {
                platforms[i].y += scrollAmount;
                
                // Убираем платформы вне экрана и добавляем новые сверху
                if (platforms[i].y > canvas.height) {
                    score += 10;
                    scoreElement.textContent = score;
                    
                    platforms[i] = {
                        x: Math.random() * (canvas.width - PLATFORM_WIDTH),
                        y: platforms[i].y - canvas.height,
                        width: PLATFORM_WIDTH,
                        height: PLATFORM_HEIGHT
                    };
                }
            }
        }

        // Проверка на конец игры (падение игрока)
        if (player.y > canvas.height) {
            endGame();
        }
    }

    // Отрисовка игровых объектов
    function draw() {
        // Очистка канваса
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Отрисовка платформ
        ctx.fillStyle = '#8fbc8f'; // Зеленый цвет для платформ
        for (let i = 0; i < platforms.length; i++) {
            const platform = platforms[i];
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }

        // Отрисовка игрока (временная прямоугольная форма)
        ctx.fillStyle = '#ff6347'; // Красно-оранжевый цвет для игрока
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Главный игровой цикл
    function gameLoop() {
        update();
        draw();
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    // Начало игры
    function startGame() {
        // Остановка предыдущего игрового цикла, если он запущен
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        
        init();
        gameRunning = true;
        gameMenu.style.display = 'none';
        gameOver.style.display = 'none';
        gameLoop();
    }

    // Конец игры
    function endGame() {
        gameRunning = false;
        finalScoreElement.textContent = score;
        gameOver.style.display = 'flex';

        // Обновление рекорда
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('doodleHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
    }

    // Обработчики событий для кнопок
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    // Инициализация начального экрана
    init();
});