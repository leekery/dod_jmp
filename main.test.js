const { app, BrowserWindow } = require('electron');

// Мокаем electron для тестирования
jest.mock('electron', () => {
    return {
        app: {
        whenReady: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        quit: jest.fn(),
        },
        BrowserWindow: jest.fn(() => ({
        loadFile: jest.fn(),
        webContents: { openDevTools: jest.fn() },
        })),
    };
});

// Импортируем main.js (код выполнится при импорте)
require('./main');

describe('main.js', () => {
    test('создаёт окно при готовности приложения', async () => {
        await app.whenReady();
        expect(BrowserWindow).toHaveBeenCalled();
    });
});
