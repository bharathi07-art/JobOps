import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

// This file is compiled and loaded as an ES Module (root package.json has
// "type": "module"), so the CommonJS-only global `__dirname` does not
// exist here. This recreates it the standard ESM way.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let LOG_PATH = '';

function logToFile(msg: string) {
  if (!LOG_PATH) return;
  fs.appendFile(LOG_PATH, `${new Date().toISOString()} ${msg}\n`).catch(() => {});
}

// Some Windows machines (VMs, remote desktop, certain Intel/AMD drivers)
// fail to render a BrowserWindow's contents at all when GPU compositing
// misbehaves — the process runs, the window exists, but nothing paints.
// Disabling hardware acceleration is a cheap, safe diagnostic step.
app.disableHardwareAcceleration();

// Prevent multiple invisible instances from stacking up in Task Manager
// across repeated test launches.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'JobOps Desktop',
    icon: path.join(__dirname, '../src/assets/JobOps.ico'),
    show: false, // wait for ready-to-show to avoid a blank flash / off-screen render
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    logToFile('ready-to-show fired, calling show()');
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Open DevTools to catch renderer errors during testing
  mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    logToFile(`did-fail-load: code=${errorCode} desc=${errorDescription} url=${validatedURL}`);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    logToFile(`render-process-gone: ${JSON.stringify(details)}`);
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    logToFile(`Loading dev server URL: ${process.env.VITE_DEV_SERVER_URL}`);
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    logToFile(`Loading packaged file: ${indexPath}`);
    mainWindow.loadFile(indexPath).catch((err) => {
      logToFile(`Failed to load index.html: ${err.stack ?? err}`);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

// Ensure Electron is fully initialized BEFORE calling app.getPath()
app.whenReady().then(() => {
  LOG_PATH = path.join(app.getPath('userData'), 'main.log');
  logToFile('App ready, userData path resolved, __dirname=' + __dirname);

  process.on('uncaughtException', (err) => {
    logToFile(`Uncaught: ${err.stack ?? err}`);
  });

  process.on('unhandledRejection', (reason) => {
    logToFile(`Unhandled Rejection: ${reason}`);
  });

  ipcMain.on('log-error', (_event, msg: string) => {
    logToFile(msg);
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});