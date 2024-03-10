import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    DialogActions,
} from '@material-ui/core'

interface SettingsDialogProps {
    open: boolean
    onClose: () => void
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
    const [baiduApiKey, setBaiduApiKey] = useState('')
    const [baiduSecretKey, setBaiduSecretKey] = useState('')

    useEffect(() => {
        const keys = window.electron.ipcRenderer.sendSync('get-baidu-keys')
        setBaiduApiKey(keys.baiduApiKey)
        setBaiduSecretKey(keys.baiduSecretKey)
    }, [])

    const handleSubmit = () => {
        window.electron.ipcRenderer.send('set-baidu-keys', {
            baiduApiKey,
            baiduSecretKey,
        })
        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="baiduApiKey"
                    label="Baidu API Key"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={baiduApiKey}
                    onChange={e => setBaiduApiKey(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="baiduSecretKey"
                    label="Baidu Secret Key"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={baiduSecretKey}
                    onChange={e => setBaiduSecretKey(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SettingsDialog
