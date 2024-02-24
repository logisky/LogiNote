import { HighlightArea, Sentence } from '@loginote/types'
import React, { useEffect, useState } from 'react'
import { TextField, Button, Chip, makeStyles, Grid } from '@material-ui/core'
import ApiClient from '../core/api_client'
import VocabularyViewer from './vocabulary-viewer'

interface HighlightSentenceViewerProps {
    fileName: string
    sentence: string
    data: HighlightArea[]
    // Notifier
    onChange: () => void
}

const useSentenceStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        marginTop: '20px',
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
        flexDirection: 'row',
        alignItems: 'flex-start',
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
    const [words, setWords] = useState<string[]>([])
    const [addedWords, setAddedWords] = useState<string[]>([])

    ApiClient.clean(editedSentence)
        .then(v => {
            setEditedSentence(v)
            ApiClient.translate(v)
                .then(t => setEditedTranslation(t))
                .catch(_e => setEditedTranslation(v))
        })
        .catch(e => {
            console.error(e)
        })

    const handleEditedSentence = (value: string) => {
        setEditedSentence(value)
        const words = value.split(' ')
        setWords(words)
    }

    const handleWordClick = (word: string) => {
        setSelectedWord(word)
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
            onChange()
        })
    }

    const wordAddedToNote = (): void => {
        if (selectedWord) setAddedWords([...addedWords, selectedWord])
    }

    return (
        <Grid container className={containerClasses.root}>
            <Grid item>
                <div className={classes.root}>
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
                    <div>
                        {words.map((word, index) => (
                            <Chip
                                key={index}
                                label={word}
                                onClick={() => handleWordClick(word)}
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
                </div>
            </Grid>
            <Grid item className={containerClasses.viewer}>
                {selectedWord && (
                    <VocabularyViewer
                        word={selectedWord}
                        wordAddedToNote={wordAddedToNote}
                    ></VocabularyViewer>
                )}
            </Grid>
        </Grid>
    )
}

export default HighlightSentenceViewer
