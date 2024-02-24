import React, { useState, useEffect } from 'react'
import { DailyProgress } from '@loginote/types'
import ApiClient from '../core/api_client'
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Collapse,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'

interface DailyProgressViewerProps {
    date: string
}

const DailyProgressViewer: React.FC<DailyProgressViewerProps> = ({ date }) => {
    const [progress, setProgress] = useState<DailyProgress | null>(null)
    const [open, setOpen] = useState(false)

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
        setOpen(!open)
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
                    {date} {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Typography>
                <Collapse in={open}>
                    <Typography variant="body2" component="p">
                        New Words: {progress.newWords.size}
                    </Typography>
                    <List dense>
                        {Array.from(progress.newWords).map((word, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={word} />
                            </ListItem>
                        ))}
                    </List>
                </Collapse>
            </CardContent>
        </Card>
    )
}

export default DailyProgressViewer
