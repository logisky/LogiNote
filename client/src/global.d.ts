declare global {
    interface Window {
        electron: {
            ipcRenderer: {
                on: (
                    channel: string,
                    listener: (
                        event: Electron.IpcRendererEvent,
                        ...args: any[]
                    ) => void
                ) => void
                invoke: (method: string, ...args: any[]) => any
                sendSync: (method: string) => any
                send: (method, data: any) => any
            }
        }
    }
}
export {}
