const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// Флаги для управления очисткой данных
const shouldClearCache = false;
const shouldClearStorageData = false;

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 600,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    // win.webContents.openDevTools(); // Отладка
}

app.whenReady().then(async () => {
    // Очистка кеша, если флаг установлен в true
    if (shouldClearCache) {
        try {
            await session.defaultSession.clearCache();
            console.log('Cache cleared successfully!');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }
    
    // Очистка прочих данных, если флаг установлен в true
    if (shouldClearStorageData) {
        try {
            await session.defaultSession.clearStorageData({
                storages: ['appcache', 'cookies', 'localstorage', 'indexdb', 'serviceworkers']
            });
            console.log('Another data cleared successfully!');
        } catch (error) {
            console.error('Error clearing other data:', error);
        }
    }

    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
