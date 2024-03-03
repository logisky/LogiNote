import React from 'react'
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
} from '@material-ui/core'
import NoteIcon from '@material-ui/icons/Note'
import HighlightIcon from '@material-ui/icons/Highlight'
import HighlightSentenceViewer from './highlight-sentence-viewer'
import { useNotifierContext } from './reader-notifier'
import { HighlightArea } from '@loginote/types'

export const Sidebar: React.FC<{ jumpTo: (ha: HighlightArea) => void }> = ({
    jumpTo,
}) => {
    const { page, sentenceData, setActiveTab, sentences } = useNotifierContext()

    const renderContent = () => {
        switch (page) {
            case 'notes':
                return (
                    <Box p={2}>
                        <List>
                            {sentences.map((s, i) => (
                                <ListItem
                                    button
                                    key={i}
                                    onClick={() => {
                                        if (s.source) {
                                            console.log(
                                                s.source.highlightAreas[0]
                                            )
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
                    </Box>
                )
            case 'highlights':
                return (
                    sentenceData && (
                        <Box p={2}>
                            <HighlightSentenceViewer
                                key={sentenceData.sentence}
                                fileName={sentenceData.fileName}
                                sentence={sentenceData.sentence}
                                data={sentenceData.data}
                                onChange={sentenceData.onChange}
                            />
                        </Box>
                    )
                )
            default:
                return <Box p={2}>Home Content</Box>
        }
    }

    return (
        <Drawer variant="permanent" style={{ width: '100%', height: '100%' }}>
            <Box display="flex" flexDirection="column" height="100%">
                {' '}
                <List>
                    <ListItem button onClick={() => setActiveTab('notes')}>
                        <ListItemIcon>
                            <NoteIcon />
                        </ListItemIcon>
                        <ListItemText primary="Notes" />
                    </ListItem>
                    <ListItem button onClick={() => setActiveTab('highlights')}>
                        <ListItemIcon>
                            <HighlightIcon />
                        </ListItemIcon>
                        <ListItemText primary="Highlights" />{' '}
                    </ListItem>
                </List>
                <Box flexGrow={1} overflow="auto">
                    {' '}
                    {renderContent()}
                </Box>
            </Box>
        </Drawer>
    )
}
