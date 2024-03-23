import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import isDev from 'electron-is-dev'
import Store from 'electron-store'
import fetch from 'node-fetch'

import { setBaiduToken } from './server/dist/server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const store = new Store()

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: join(__dirname, 'preload.cjs'),
        },
    })

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${join(__dirname, 'client/build/index.html')}`

    mainWindow.loadURL(startUrl)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.webContents.openDevTools()
}

app.on('ready', () => {
    createWindow()
})

const defaultNoteDir = join(app.getPath('home'), 'loginote')

ipcMain.on('get-note-dir', event => {
    event.returnValue = store.get('noteDir', defaultNoteDir)
})
ipcMain.on('set-note-dir', (_, newDir) => {
    store.set('noteDir', newDir)
})
ipcMain.on('get-baidu-keys', event => {
    event.returnValue = store.get('baiduApiKeys', {
        baiduApiKey: '',
        baiduSecretKey: '',
    })
})
ipcMain.on('set-baidu-keys', (_, value) => {
    store.set('baiduApiKeys', value)
    getAccessToken(value.baiduApiKey, value.baiduSecretKey)
})

ipcMain.handle('open-directory-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
    })
    if (result.canceled) return ''
    return result.filePaths[0]
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
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

function getAccessToken(apiKey, secretKey) {
    if (apiKey === '' || secretKey === '') return

    fetch(
        `https://aip.baidubce.com/oauth/2.0/token?client_id=${apiKey}&client_secret=${secretKey}&grant_type=client_credentials`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        }
    )
        .then(v => {
            v.json()
                .then(r => {
                    store.set('accessToken', r.access_token)
                    console.log(r)
                    setBaiduToken(r.access_token)
                })
                .catch(e => {
                    console.error(e)
                })
        })
        .catch(e => {
            console.error(e)
        })
}
