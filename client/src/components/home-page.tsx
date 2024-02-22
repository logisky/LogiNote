import React, { useState, useEffect } from 'react'
import {
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    makeStyles,
} from '@material-ui/core'
import NavigatorBar from './navigator-bar'
import ApiClient from '../core/api_client'
import { TotalProgress } from '@loginote/types'
import DailyProgressViewer from './daily-progress-viewer'
import TotalProgressViewer from './total-progress-viewer'
import FileBrowser from './file-browser'

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}))

const HomePage: React.FC = () => {
    const classes = useStyles()
    const [noteDir, setNoteDir] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [dateList, setDateList] = useState<string[]>([])
    const [totalProgress, setTotalProgress] = useState<TotalProgress | null>(
        null
    )

    useEffect(() => {
        const dir = window.electron.ipcRenderer.sendSync('get-note-dir')
        setNoteDir(dir)
        openDirectory(dir)
    }, [])

    const openDirectory = (dir: string) => {
        ApiClient.openDirectory(dir).then(totalProgress => {
            if (!totalProgress) return
            setDateList(totalProgress.dateList)
            setTotalProgress(totalProgress)
        })
    }

    const handleDateClick = (date: string): void => {
        setSelectedDate(date)
    }

    const onChangeDir = (dir: string): void => {
        setNoteDir(dir)
        window.electron.ipcRenderer.send('set-note-dir', dir)
        openDirectory(dir)
    }

    return (
        <>
            <NavigatorBar noteDir={noteDir} onChangeDir={onChangeDir} />
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <Paper className={classes.paper}>
                        <List component="nav">
                            <ListItem button key={dateList.length}>
                                <FileBrowser></FileBrowser>
                            </ListItem>
                            {dateList.map((date, index) => (
                                <ListItem
                                    button
                                    key={index}
                                    onClick={() => handleDateClick(date)}
                                >
                                    <ListItemText primary={date} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={8}>
                    <Paper className={classes.paper}>
                        {selectedDate ? (
                            <DailyProgressViewer
                                date={selectedDate}
                            ></DailyProgressViewer>
                        ) : totalProgress ? (
                            <TotalProgressViewer
                                totalProgress={totalProgress}
                            ></TotalProgressViewer>
                        ) : (
                            <h1>Loading</h1>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

export default HomePage
