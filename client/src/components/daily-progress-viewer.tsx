import React, { useState, useEffect } from 'react'
import { DailyProgress, SentenceId } from '@loginote/types'
import ApiClient from '../core/api_client'
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Button,
    Modal,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import SentenceCheckComponent from './sentence-check'

export interface StartSentenceCheckComponentProps {
    s: string
    handle: (s: string) => Promise<SentenceId>
}

export const StartSentenceCheckComponent: React.FC<
    StartSentenceCheckComponentProps
> = ({ handle, s }) => {
    const [sentenceId, setSentenceId] = useState<SentenceId | null>(null)
    useEffect(() => {
        handle(s).then(id => {
            if (id >= 0) {
                setSentenceId(id)
            } else {
                setSentenceId(null)
            }
        })
    }, [s, handle])

    if (sentenceId === null) return null

    return <SentenceCheckComponent id={sentenceId}></SentenceCheckComponent>
}

interface DailyProgressViewerProps {
    date: string
}

const DailyProgressViewer: React.FC<DailyProgressViewerProps> = ({ date }) => {
    const [progress, setProgress] = useState<DailyProgress | null>(null)
    const [extendOpen, setExtendOpen] = useState(false)
    const [sentenceCheckOpen, setSenetenceCheckOpen] = useState(false)

    useEffect(() => {
        ApiClient.getDailyProgress(date)
            .then((data: DailyProgress | null) => {
                if (data) setProgress(data)
            })
            .catch(error => {
                console.error('Failed to fetch daily progress:', error)
            })
    }, [date])

    const handleToggleDetails = () => {
        setExtendOpen(!extendOpen)
    }

    if (!progress) {
        return <Typography>Loading...</Typography>
    }

    return (
        <Card>
            <CardContent>
                <Typography
                    variant="h5"
                    component="h2"
                    onClick={handleToggleDetails}
                    style={{ cursor: 'pointer' }}
                >
                    {date}{' '}
                    {extendOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Typography>
                <Collapse in={extendOpen}>
                    <Typography variant="body2" component="p">
                        New Words: {progress.newWords.length}
                    </Typography>
                    <List dense>
                        {Array.from(progress.newWords).map((word, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={word} />
                            </ListItem>
                        ))}
                    </List>
                </Collapse>
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
                    style={{ backdropFilter: 'blur(3px) grayscale(90%)' }}
                    onClose={() => {
                        setSenetenceCheckOpen(false)
                    }}
                >
                    <StartSentenceCheckComponent
                        s={date}
                        handle={d => ApiClient.getDateRandomSentence(d)}
                    ></StartSentenceCheckComponent>
                </Modal>
            </CardContent>
        </Card>
    )
}

export default DailyProgressViewer
