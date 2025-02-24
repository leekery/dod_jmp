/**
 * @jest-environment jsdom
 */

// Задаём минимальную разметку для тестирования
document.body.innerHTML = `
    <canvas id="gameCanvas" width="400" height="600"></canvas>
    <div id="score"></div>
    <div id="highScore"></div>
    <div id="finalScore"></div>
    <div id="gameMenu" style="display: block;"></div>
    <div id="gameOver" style="display: block;"></div>
    <button id="startButton"></button>
    <button id="restartButton"></button>
`;

// Подменяем requestAnimationFrame и cancelAnimationFrame для тестового окружения
global.requestAnimationFrame = function(callback) {
    return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function(id) {
    clearTimeout(id);
};

// Добавляем мок для getContext у canvas, чтобы избежать ошибки "Not implemented"
const canvasElement = document.getElementById('gameCanvas');
canvasElement.getContext = function() {
    return {
        clearRect: () => {},
        fillRect: () => {},
    };
};

// Сначала подключаем game.js, чтобы обработчик DOMContentLoaded был установлен
require('./game');

// Затем диспатчим событие DOMContentLoaded, чтобы вызвать обработчик из game.js
document.dispatchEvent(new Event('DOMContentLoaded'));

describe('game.js', () => {
    test('при клике на startButton скрываются gameMenu и gameOver', () => {
        const startButton = document.getElementById('startButton');
        startButton.click();

        const gameMenu = document.getElementById('gameMenu');
        const gameOver = document.getElementById('gameOver');

        expect(gameMenu.style.display).toBe('none');
        expect(gameOver.style.display).toBe('none');
    });
});