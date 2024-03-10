import React, { useState } from 'react'
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    makeStyles,
} from '@material-ui/core'
import SettingsDialog from './settings'

interface NavbarProps {
    noteDir: string
    onChangeDir: (dir: string) => void
}

const useStyles = makeStyles(() => ({
    title: {
        flexGrow: 1,
    },
}))

const NavigatorBar: React.FC<NavbarProps> = ({ noteDir, onChangeDir }) => {
    const classes = useStyles()
    const [openDialog, setOpenDialog] = useState(false)
    const handleCloseDialog = () => {
        setOpenDialog(false)
    }

    const handleSelectDirectory = async () => {
        const path = await window.electron.ipcRenderer.invoke(
            'open-directory-dialog'
        )
        if (path !== '') onChangeDir(path)
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" className={classes.title}>
                    LogiNote - {noteDir}
                </Typography>
                <Button color="inherit" onClick={handleSelectDirectory}>
                    Change Directory
                </Button>
                <Button variant="contained" color="primary">
                    Settings
                </Button>
                <SettingsDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                ></SettingsDialog>
            </Toolbar>
        </AppBar>
    )
}

export default NavigatorBar
