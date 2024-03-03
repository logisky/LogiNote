import React, { useEffect, useState } from 'react'
import ApiClient from '../core/api_client'
import { Vocabulary } from '@loginote/types' // 假设这是你的类型定义
import {
    Button,
    Card,
    CardContent,
    Modal,
    Typography,
    makeStyles,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    List,
    ListItem,
    Box,
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
    onClose: () => void
}

const VocabularyViewer: React.FC<VocabularyViewerProps> = ({
    word,
    wordAddedToNote,
    modalStyle,
    open,
    onClose,
}) => {
    const classes = useStyles()
    const [vocabulary, setVocabulary] = useState<Vocabulary | null>(null)
    const [exporationOpen, setExporationOpen] = useState(false)

    useEffect(() => {
        if (word) {
            ApiClient.getVocabulary(word)
                .then(info => {
                    setVocabulary(info)
                })
                .catch(error =>
                    console.error('Failed to fetch word info:', error)
                )
        }
    }, [word])

    if (!vocabulary) {
        return (
            <Modal open={open} onClose={onClose} className={classes.modal}>
                <Card className={classes.errorCard}>
                    <Typography variant="h6" color="error" gutterBottom>
                        Unable to Load Vocabulary
                    </Typography>
                    <Typography variant="body1">
                        Please check your network connection and try again.
                    </Typography>
                </Card>
            </Modal>
        )
    }

    const handleSubmit = () => {
        ApiClient.postVocabulary(vocabulary)
        wordAddedToNote()
    }

    const handleExitExporation = () => {
        setExporationOpen(false)
    }

    return (
        <div>
            <Modal open={open} onClose={onClose} className={classes.modal}>
                <Card className={classes.card} style={modalStyle}>
                    <CardContent className={classes.contentScroll}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            {vocabulary.vocabulary0?.word}
                        </Typography>
                        {vocabulary.vocabulary0?.phonetics.map(
                            (phonetic, index) => (
                                <div
                                    key={index}
                                    className={classes.phoneticText}
                                >
                                    <Typography color="textSecondary">
                                        {phonetic.text}
                                    </Typography>
                                    {phonetic.audio && (
                                        <IconButton aria-label="play">
                                            <audio
                                                src={phonetic.audio}
                                                controls
                                            />
                                        </IconButton>
                                    )}
                                </div>
                            )
                        )}
                        {vocabulary.vocabulary0?.meanings.map(
                            (meaning, index) => (
                                <Accordion key={index}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                    >
                                        <Typography>
                                            {meaning.partOfSpeech}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {meaning.definitions.map(
                                            (def, defIndex) => (
                                                <div key={defIndex}>
                                                    <Typography paragraph>
                                                        {def.definition}
                                                    </Typography>
                                                    {def.example && (
                                                        <Typography
                                                            paragraph
                                                        >{`Example: ${def.example}`}</Typography>
                                                    )}
                                                    {def.synonyms.length >
                                                        0 && (
                                                        <Typography
                                                            paragraph
                                                        >{`Synonyms: ${def.synonyms.join(', ')}`}</Typography>
                                                    )}
                                                    {def.antonyms.length >
                                                        0 && (
                                                        <Typography
                                                            paragraph
                                                        >{`Antonyms: ${def.antonyms.join(', ')}`}</Typography>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            )
                        )}
                        {vocabulary.vocabulary0 &&
                            vocabulary.vocabulary0.spelledLike.length > 0 && (
                                <List className={classes.spelledLikeList}>
                                    <Typography variant="subtitle1">
                                        Similar Spellings:
                                    </Typography>
                                    {vocabulary.vocabulary0?.spelledLike.map(
                                        (word, index) => (
                                            <ListItem key={index}>
                                                {word}
                                            </ListItem>
                                        )
                                    )}
                                </List>
                            )}
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
