import React from 'react'
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    makeStyles,
} from '@material-ui/core'

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
                    Logo - {noteDir}
                </Typography>
                <Button color="inherit" onClick={handleSelectDirectory}>
                    Change Directory
                </Button>
            </Toolbar>
        </AppBar>
    )
}

export default NavigatorBar
