import React, { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    DialogActions,
    DialogContent,
} from '@material-ui/core'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import ApiClient from '../core/api_client'
import { FileInfo } from '@loginote/types'
import { useNavigate } from 'react-router-dom'

const FileBrowser: React.FC = () => {
    const [open, setOpen] = useState(false)
    const [files, setFiles] = useState<FileInfo[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        ApiClient.getFiles()
            .then((data: FileInfo[]) => {
                setFiles(data)
            })
            .catch(error => {
                console.error('Failed to fetch files:', error)
            })
    }, [])

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleFileClick = (fileName: FileInfo) => {
        navigate(`/pdf-viewer/${encodeURIComponent(fileName.name)}`)
    }

    const handleUploadClick = async () => {
        const path =
            await window.electron.ipcRenderer.invoke('select-file-dialog')
        const result = await ApiClient.postFile(path)
        if (result) {
            navigate(`/pdf-viewer/${encodeURIComponent(result)}`)
        }
    }

    return (
        <div>
            <Button
                variant="outlined"
                onClick={handleClickOpen}
                startIcon={<CloudUploadIcon />}
            >
                +
            </Button>
            <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
                <DialogTitle>Files</DialogTitle>
                <DialogContent>
                    <List>
                        {files.map((file, index) => (
                            <ListItem
                                button
                                onClick={() => handleFileClick(file)}
                                key={index}
                            >
                                <ListItemText primary={file.name} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleUploadClick} color="primary">
                        Upload
                    </Button>
                    <Button onClick={handleClose} color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default FileBrowser
