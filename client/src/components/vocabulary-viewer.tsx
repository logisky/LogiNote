import React, { useEffect, useState } from 'react'
import ApiClient from '../core/api_client'
import { StarDictVocabulary } from '@loginote/types'
import {
    Button,
    Card,
    CardContent,
    Modal,
    Typography,
    makeStyles,
    IconButton,
    Box,
    Chip,
    ExpansionPanelDetails,
    ExpansionPanel,
    ExpansionPanelSummary,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import CloseIcon from '@material-ui/icons/Close'
import WordRelationsViewer from './word-relation-viewer'

const useStyles = makeStyles(theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
    },
    card: {
        width: '90%',
        maxWidth: 700,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
    },
    contentScroll: {
        maxHeight: '80vh',
        overflowY: 'auto',
    },
    phoneticText: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    spelledLikeList: {
        marginTop: theme.spacing(2),
    },
    errorCard: {
        padding: theme.spacing(2),
        maxWidth: 400,
        textAlign: 'center',
        margin: 'auto',
    },
    chipContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: '8px',
        '& > *': {
            margin: '4px',
        },
    },
    subtleButton: {
        color: theme.palette.grey[600],
        backgroundColor: theme.palette.grey[100],
        border: `1px solid ${theme.palette.grey[300]}`,
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
            boxShadow: 'none',
        },
        boxShadow: '0 2px 2px rgba(0,0,0,0.1)',
        textTransform: 'none',
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    modalContent: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95%',
        height: '95%',
        bgcolor: 'background.paper',
        boxShadow: '24',
        p: 4,
        overflow: 'auto',
    },
}))

interface VocabularyViewerProps {
    word: string
    wordAddedToNote: () => void
    modalStyle: React.CSSProperties
    open: boolean
    close: () => void
}

const VocabularyViewer: React.FC<VocabularyViewerProps> = ({
    word,
    wordAddedToNote,
    modalStyle,
    open,
    close,
}) => {
    const classes = useStyles()
    const [vocabulary, setVocabulary] = useState<StarDictVocabulary | null>(
        null
    )
    const [exporationOpen, setExporationOpen] = useState(false)

    useEffect(() => {
        if (word) {
            ApiClient.searchVocabulary(word)
                .then(info => {
                    console.log(info.vocabulary1)
                    setVocabulary(info.vocabulary1)
                })
                .catch(error =>
                    console.error('Failed to fetch word info:', error)
                )
        }
    }, [word])

    if (!vocabulary) {
        return (
            <Modal open={open} onClose={close} className={classes.modal}>
                <Card className={classes.errorCard}>
                    <Typography variant="h6" color="error" gutterBottom>
                        Wait...
                    </Typography>
                </Card>
            </Modal>
        )
    }

    const handleSubmit = () => {
        ApiClient.postVocabulary({ vocabulary0: null, vocabulary1: vocabulary })
        wordAddedToNote()
        close()
    }

    const handleExitExporation = () => {
        setExporationOpen(false)
    }

    return (
        <div>
            <Modal open={open} onClose={close} className={classes.modal}>
                <Card className={classes.card} style={modalStyle}>
                    <CardContent className={classes.contentScroll}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            {vocabulary.word}
                        </Typography>
                        <Typography>[{vocabulary.phonetic}]</Typography>
                        {vocabulary.translations && (
                            <List>
                                {vocabulary.translations.map((n, i) => (
                                    <ListItem key={i}>
                                        <ListItemText
                                            primary={n}
                                        ></ListItemText>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        {vocabulary.exchange && (
                            <Typography color="textSecondary">
                                {vocabulary.exchange.join('\n')}
                            </Typography>
                        )}
                        {vocabulary.tags && (
                            <div className={classes.chipContainer}>
                                {vocabulary.tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag}
                                        variant="outlined"
                                    />
                                ))}
                            </div>
                        )}
                        <Typography
                            color="textSecondary"
                            variant="body2"
                            gutterBottom
                        >
                            BNC: {vocabulary.bnc ?? 'unknown'}, FRQ:{' '}
                            {vocabulary.frq ?? 'unknown'}
                        </Typography>
                        <ExpansionPanel>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                            >
                                <Typography>Definitions</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                {vocabulary.definitions.map(
                                    (definition, index) => (
                                        <Typography key={index} paragraph>
                                            {definition}
                                        </Typography>
                                    )
                                )}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                        <Button
                            className={classes.subtleButton}
                            onClick={() => setExporationOpen(true)}
                        >
                            Start exploration
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            style={{ marginTop: 16 }}
                        >
                            Add to your note
                        </Button>
                    </CardContent>
                </Card>
            </Modal>
            <Modal
                open={exporationOpen}
                onClose={handleExitExporation}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box className={classes.modalContent}>
                    <IconButton
                        aria-label="close"
                        className={classes.closeButton}
                        onClick={handleExitExporation}
                    >
                        <CloseIcon />
                    </IconButton>
                    <h2 id="modal-title">Modal Title</h2>
                    <WordRelationsViewer word={word}></WordRelationsViewer>
                </Box>
            </Modal>
        </div>
    )
}

export default VocabularyViewer
