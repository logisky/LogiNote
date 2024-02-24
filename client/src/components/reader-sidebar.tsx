import { Drawer, List, ListItem, ListItemIcon } from '@material-ui/core'
import NoteIcon from '@material-ui/icons/Note'
import HighlightIcon from '@material-ui/icons/Highlight'
import HighlightSentenceViewer from './highlight-sentence-viewer'
import { useNotifierContext } from './reader-notifier'

export const Sidebar = () => {
    const { page, sentenceData, setActiveTab } = useNotifierContext()
    const renderContent = () => {
        switch (page) {
            case 'notes':
                return <div>Notes Content</div>
            case 'highlights':
                return (
                    sentenceData && (
                        <HighlightSentenceViewer
                            key={sentenceData.sentence}
                            fileName={sentenceData.fileName}
                            sentence={sentenceData.sentence}
                            data={sentenceData.data}
                            onChange={sentenceData.onChange}
                        ></HighlightSentenceViewer>
                    )
                )
            default:
                return <div>Home Content</div>
        }
    }

    return (
        <Drawer variant="permanent">
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
            {renderContent()}
        </Drawer>
    )
}
