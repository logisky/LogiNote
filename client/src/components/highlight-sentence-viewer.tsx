import { HighlightArea, Sentence } from '@loginote/types'
import React, { MouseEvent, useEffect, useState } from 'react'
import { TextField, Button, Chip, makeStyles, Grid } from '@material-ui/core'
import ApiClient from '../core/api_client'
import VocabularyViewer from './vocabulary-viewer'
import { useNotifierContext } from './reader-notifier'

export interface HighlightSentenceViewerProps {
    fileName: string
    sentence: string
    data: HighlightArea[]
    // Notifier
    onChange: (sentence: Sentence) => void
}

const useSentenceStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
        marginTop: '20px',
        marginLeft: '10px',
    },
    inputHover: {
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    selectedWord: {
        backgroundColor: '#aed581',
    },
})

const useContainerStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    viewer: {
        marginLeft: '20px', // Add some space between the components
    },
})

const HighlightSentenceViewer: React.FC<HighlightSentenceViewerProps> = ({
    sentence,
    data,
    fileName,
    onChange,
}) => {
    const classes = useSentenceStyles()
    const containerClasses = useContainerStyles()
    const [selectedWord, setSelectedWord] = useState<string | null>(null)
    const [editedSentence, setEditedSentence] = useState(sentence)
    const [editedTranslation, setEditedTranslation] = useState<string>('')
    const [words, setWords] = useState<string[]>(sentence.split(' '))
    const [addedWords, setAddedWords] = useState<string[]>([])

    const [showVocabulary, setShowVocabulary] = useState(false)
    const [modalStyle, setModalStyle] = useState({})

    useEffect(() => {
        ApiClient.clean(editedSentence)
            .then(v => {
                handleEditedSentence(v)
            })
            .catch(e => {
                console.error(e)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const { sentences, setSentences, setActiveTab } = useNotifierContext()

    const handleClickTranslate = () => {
        ApiClient.translate(editedSentence)
            .then(v => {
                setEditedTranslation(v)
            })
            .catch(e => {
                console.error(e)
            })
    }

    const handleEditedSentence = (value: string) => {
        setEditedSentence(value)
        const words = value
            .split(' ')
            .map(s => s.trim())
            .filter(s => s !== '')
        setWords(words)
        setSelectedWord(null)
    }

    const handleWordClick = (event: MouseEvent, word: string) => {
        setSelectedWord(word)

        const { pageX, pageY } = event

        const newModalStyle = {
            position: 'absolute',
            top: pageY,
            left: pageX + 10,
        }

        setModalStyle(newModalStyle)
        setShowVocabulary(true)
    }

    const handleSubmit = () => {
        const sentence: Sentence = {
            id: -1,
            content: editedSentence,
            translation: editedTranslation,
            words: addedWords,
            source: { filePath: fileName, highlightAreas: data },
        }
        ApiClient.postSentence(sentence).then(() => {
            setSentences([...sentences, sentence])
            setActiveTab('notes')
            onChange(sentence)
        })
    }

    const wordAddedToNote = (): void => {
        if (selectedWord) setAddedWords([...addedWords, selectedWord])
    }

    return (
        <Grid container className={containerClasses.root}>
            <Grid item className={classes.root}>
                <TextField
                    value={editedSentence}
                    onChange={e => handleEditedSentence(e.target.value)}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        className: classes.inputHover,
                    }}
                    placeholder="Edit the sentence"
                    multiline
                />
                <TextField
                    value={editedTranslation}
                    onChange={e => setEditedTranslation(e.target.value)}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        className: classes.inputHover,
                    }}
                    placeholder="Edit the translation"
                    multiline
                />
                <Button onClick={handleClickTranslate}>Translate</Button>
                <div>
                    {words.map((word, index) => (
                        <Chip
                            key={index}
                            label={word}
                            onClick={e => handleWordClick(e, word)}
                            className={
                                selectedWord === word
                                    ? classes.selectedWord
                                    : ''
                            }
                        />
                    ))}
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                >
                    Add to your note
                </Button>
            </Grid>
            <Grid item className={containerClasses.viewer}>
                {showVocabulary && selectedWord && (
                    <VocabularyViewer
                        word={selectedWord}
                        wordAddedToNote={wordAddedToNote}
                        modalStyle={modalStyle}
                        open={showVocabulary}
                        onClose={() => setShowVocabulary(false)}
                    ></VocabularyViewer>
                )}
            </Grid>
        </Grid>
    )
}

export default HighlightSentenceViewer
