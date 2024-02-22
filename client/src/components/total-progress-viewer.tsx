import React from 'react'
import { TotalProgress } from '@loginote/types'
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core'

interface TotalProgressViewerProps {
    totalProgress: TotalProgress
}

const TotalProgressViewer: React.FC<TotalProgressViewerProps> = ({
    totalProgress,
}) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="h2">
                    Total Progress
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText
                            primary={`Words learned: ${totalProgress.words}`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={`Sentences practiced: ${totalProgress.sentences}`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={`Sets completed: ${totalProgress.sets}`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={`Articles read: ${totalProgress.articles}`}
                        />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    )
}

export default TotalProgressViewer
