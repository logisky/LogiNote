import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'path'
import { fork } from 'child_process'
import { fileURLToPath } from 'url'
import isDev from 'electron-is-dev'
import Store from 'electron-store'
import fetch from 'node-fetch'
import fs from 'fs'
import FormData from 'form-data'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const store = new Store()

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 1000,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: join(__dirname, 'preload.js'),
        },
    })

    const startUrl = isDev
        ? 'http://localhost:3000' // React开发服务器地址
        : `file://${join(__dirname, 'client/build/index.html')}` // 生产环境的React构建版本地址

    mainWindow.loadURL(startUrl)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.webContents.openDevTools()
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

const defaultNoteDir = join(app.getPath('home'), 'loginote')

ipcMain.on('get-note-dir', event => {
    event.returnValue = store.get('noteDir', defaultNoteDir)
})
ipcMain.on('set-note-dir', (_, newDir) => {
    store.set('noteDir', newDir)
})

ipcMain.handle('open-directory-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
    })
    if (result.canceled) return ''
    return result.filePaths[0]
})

ipcMain.handle('upload-file', async (_, filePath) => {
    const file = fs.createReadStream(filePath)
    const formData = new FormData()
    formData.append('file', file)

    try {
        const response = await fetch(`http://localhost:3001/file`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
        })

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
        }
        const result = await response.json()
        return result
    } catch (error) {
        console.error('Error uploading file:', error)
        throw error
    }
})

ipcMain.handle('select-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
    })
    if (result.canceled) return ''
    return result.filePaths[0]
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
