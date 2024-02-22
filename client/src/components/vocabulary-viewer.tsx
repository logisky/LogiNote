import React, { useEffect, useState } from 'react'
import { DataFetcher } from '../core/data'
import { Vocabulary } from '@loginote/types'
import {
    Button,
    Card,
    CardContent,
    Typography,
    makeStyles,
} from '@material-ui/core'
import ApiClient from '../core/api_client'

interface VocabularyViewerProps {
    word: string
    wordAddedToNote: () => void
}

const useStyles = makeStyles({
    card: {
        minWidth: 275,
        margin: '20px',
        position: 'absolute',
        right: 0,
        top: '10%',
        zIndex: 100,
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
})

const VocabularyViewer: React.FC<VocabularyViewerProps> = ({
    word,
    wordAddedToNote,
}) => {
    const classes = useStyles()
    const [vocabulary, setVocabulary] = useState<Vocabulary | null>(null)

    useEffect(() => {
        if (word) {
            DataFetcher.fetchVocabulary(word)
                .then(info => {
                    setVocabulary(info)
                })
                .catch(error =>
                    console.error('Failed to fetch word info:', error)
                )
        }
    }, [word])
    if (!vocabulary) {
        return <h1>Cannot check the vocabulary, please check your network</h1>
    }

    const handleSubmit = () => {
        ApiClient.postVocabulary(vocabulary)
        wordAddedToNote()
    }

    return (
        <Card className={classes.card}>
            <CardContent>
                <Typography variant="h5" component="h2">
                    {vocabulary.word}
                </Typography>
                {vocabulary.phonetics.map((phonetic, index) => (
                    <Typography
                        key={index}
                        className={classes.pos}
                        color="textSecondary"
                    >
                        {phonetic.text}
                        {phonetic.audio && (
                            <audio src={phonetic.audio} controls />
                        )}
                    </Typography>
                ))}
                {vocabulary.meanings.map((meaning, index) => (
                    <div key={index}>
                        <Typography variant="body2" component="p">
                            {meaning.partOfSpeech}
                            {meaning.definitions.map((def, defIndex) => (
                                <div key={defIndex}>
                                    <Typography paragraph>
                                        {def.definition}
                                    </Typography>
                                    {def.example && (
                                        <Typography
                                            paragraph
                                        >{`Example: ${def.example}`}</Typography>
                                    )}
                                    {def.synonyms && (
                                        <Typography
                                            paragraph
                                        >{`Synonyms: ${def.synonyms.join(', ')}`}</Typography>
                                    )}
                                </div>
                            ))}
                        </Typography>
                    </div>
                ))}
                {vocabulary.spelledLike.length > 0 && (
                    <Typography variant="body2" component="p">
                        Similar Spellings: {vocabulary.spelledLike.join(', ')}
                    </Typography>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                >
                    Add to your note
                </Button>
            </CardContent>
        </Card>
    )
}

export default VocabularyViewer
