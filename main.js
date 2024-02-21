import { app, BrowserWindow } from 'electron'
import { join, dirname } from 'path'
import { fork } from 'child_process'
import { fileURLToPath } from 'url'
import isDev from 'electron-is-dev'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    const startUrl = isDev
        ? 'http://localhost:3000' // React开发服务器地址
        : `file://${join(__dirname, 'client/build/index.html')}` // 生产环境的React构建版本地址

    mainWindow.loadURL(startUrl)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

let serverProcess = null
function startServer() {
    const serverPath = join(__dirname, 'server/dist/server.js')
    serverProcess = fork(serverPath)
}

app.on('ready', () => {
    startServer()
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (serverProcess) {
            serverProcess.kill()
        }
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})
