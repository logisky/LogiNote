import React, { useState, useEffect } from 'react'
import {
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Button,
    Modal,
    Typography,
} from '@material-ui/core'
import NavigatorBar from './navigator-bar'
import ApiClient from '../core/api_client'
import { FileInfo, TotalProgress } from '@loginote/types'
import DailyProgressViewer, {
    StartSentenceCheckComponent,
} from './daily-progress-viewer'
import TotalProgressViewer from './total-progress-viewer'
import FileBrowser from './file-browser'
import { BookmarkIcon } from '@react-pdf-viewer/default-layout'

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

    const [fileList, setFileList] = useState<FileInfo[]>([])
    const [viewType, setViewType] = useState('date')
    const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)
    const [sentenceCheckOpen, setSenetenceCheckOpen] = useState(false)

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

    const handleFileClick = (fileName: string): void => {
        const fileInfo = fileList.find(f => f.name === fileName) as FileInfo
        setSelectedFile(fileInfo)
    }

    const onChangeDir = (dir: string): void => {
        setNoteDir(dir)
        window.electron.ipcRenderer.send('set-note-dir', dir)
        openDirectory(dir)
    }

    const handleChangeView = () => {
        if (viewType === 'date') {
            setViewType('file')
            ApiClient.getFiles().then(files => {
                setFileList(files)
            })
        } else {
            setViewType('date')
        }
    }

    const listItem = (list: string[], handle: (s: string) => void) => {
        return (
            <List component="nav">
                <ListItem button key={list.length}>
                    <FileBrowser></FileBrowser>
                </ListItem>
                {list.map((l, index) => (
                    <ListItem button key={index} onClick={() => handle(l)}>
                        <ListItemText primary={l} />
                    </ListItem>
                ))}
            </List>
        )
    }

    return (
        <>
            <NavigatorBar noteDir={noteDir} onChangeDir={onChangeDir} />
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <Button
                        variant="outlined"
                        onClick={handleChangeView}
                        startIcon={<BookmarkIcon />}
                    ></Button>
                    <Paper className={classes.paper}>
                        {viewType === 'date' &&
                            listItem(dateList, handleDateClick)}
                        {viewType === 'file' &&
                            listItem(
                                fileList.map(f => f.name),
                                handleFileClick
                            )}
                    </Paper>
                </Grid>
                <Grid item xs={8}>
                    {viewType === 'date' && (
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
                    )}
                    {viewType === 'file' && (
                        <Paper className={classes.paper}>
                            <Typography
                                variant="h5"
                                component="h2"
                                style={{ cursor: 'pointer' }}
                            >
                                {selectedFile?.name}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setSenetenceCheckOpen(true)}
                            >
                                Start 1 Sentence Check
                            </Button>
                            <Modal
                                open={sentenceCheckOpen}
                                aria-labelledby="modal-title"
                                aria-describedby="modal-description"
                                style={{
                                    backdropFilter: 'blur(3px) grayscale(90%)',
                                }}
                                onClose={() => {
                                    setSenetenceCheckOpen(false)
                                }}
                            >
                                <StartSentenceCheckComponent
                                    s={selectedFile?.name ?? ''}
                                    handle={f =>
                                        ApiClient.getFileRandomSentence(f)
                                    }
                                ></StartSentenceCheckComponent>
                            </Modal>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </>
    )
}

export default HomePage
