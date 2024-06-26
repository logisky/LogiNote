import React from 'react'
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Grid,
    Divider,
} from '@material-ui/core'
import NoteIcon from '@material-ui/icons/Note'
import HighlightIcon from '@material-ui/icons/Highlight'
import HighlightSentenceViewer from './highlight-sentence-viewer'
import { useNotifierContext } from './reader-notifier'
import { HighlightArea } from '@loginote/types'
import { ExitToApp } from '@material-ui/icons'
import { useNavigate } from 'react-router-dom'

export const Sidebar: React.FC<{ jumpTo: (ha: HighlightArea) => void }> = ({
    jumpTo,
}) => {
    const { page, sentenceData, setActiveTab, sentences } = useNotifierContext()
    const navigate = useNavigate()

    const renderContent = () => {
        switch (page) {
            case 'notes':
                return (
                    <List style={{ maxWidth: '100%', whiteSpace: 'nowrap' }}>
                        {sentences.map((s, i) => (
                            <ListItem
                                button
                                key={i}
                                style={{
                                    maxHeight: '100%',
                                    maxWidth: '100%',
                                    overflowX: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                                onClick={() => {
                                    if (s.source) {
                                        jumpTo(s.source.highlightAreas[0])
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={s.content}
                                ></ListItemText>
                            </ListItem>
                        ))}
                    </List>
                )
            case 'highlights':
                if (!sentenceData) {
                    return <Grid style={{ width: '100%' }}></Grid>
                } else {
                    return (
                        <Box
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyItems: 'center',
                            }}
                        >
                            <HighlightSentenceViewer
                                key={sentenceData.sentence}
                                fileName={sentenceData.fileName}
                                sentence={sentenceData.sentence}
                                data={sentenceData.data}
                                onChange={sentenceData.onChange}
                            />
                        </Box>
                    )
                }
            default:
                return <Box p={2}>Home Content</Box>
        }
    }

    return (
        <Grid
            container
            style={{
                flexWrap: 'nowrap',
                height: '100%',
                width: '100%',
            }}
        >
            <Grid
                item
                xs={2}
                style={{ backgroundColor: '#f4f4f4', width: '100%' }}
            >
                {' '}
                <List>
                    <ListItem button onClick={() => setActiveTab('notes')}>
                        <ListItemIcon>
                            <NoteIcon />
                        </ListItemIcon>
                    </ListItem>
                    <ListItem button onClick={() => setActiveTab('highlights')}>
                        <ListItemIcon>
                            <HighlightIcon />
                        </ListItemIcon>
                    </ListItem>
                </List>
                <Divider></Divider>
                <List
                    style={{
                        display: 'flex',
                        flexDirection: 'column-reverse',
                    }}
                >
                    <ListItem
                        button
                        onClick={() => {
                            navigate('/')
                        }}
                    >
                        <ListItemIcon>
                            <ExitToApp />
                        </ListItemIcon>
                    </ListItem>
                </List>
            </Grid>
            <Grid
                item
                xs={9}
                style={{
                    width: '100%',
                }}
            >
                {renderContent()}
            </Grid>
        </Grid>
    )
}
