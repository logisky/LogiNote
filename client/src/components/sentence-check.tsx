import React, { useState, useEffect, MouseEvent } from 'react'
import { Box, Button, Chip, Container, Typography } from '@material-ui/core'
import { Sentence, SentenceId } from '@loginote/types'
import ApiClient from '../core/api_client'
import VocabularyViewer from './vocabulary-viewer'

interface SentenceCheckComponentProps {
    id: SentenceId
}

const SentenceCheckComponent: React.FC<SentenceCheckComponentProps> = ({
    id,
}) => {
    const [sentence, setSentence] = useState<Sentence | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [word, setWord] = useState('')
    const [modalStyle, setModalStyle] = useState({})

    useEffect(() => {
        const loadData = async () => {
            const result = await ApiClient.getSentence(id)
            setSentence(result)
        }
        loadData()
    }, [id])

    const handleWordClick = (event: MouseEvent, word: string) => {
        setWord(word)

        const { pageX, pageY } = event

        const newModalStyle = {
            position: 'absolute',
            top: pageY,
            left: pageX + 10,
        }

        setModalStyle(newModalStyle)
    }

    return (
        sentence && (
            <Container
                maxWidth="sm"
                style={{
                    backgroundColor: '#f5f5f5',
                    marginTop: '20px',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Typography
                        variant="body1"
                        style={{ marginBottom: '20px' }}
                    >
                        {sentence.translation}
                    </Typography>
                    {showDetails && (
                        <>
                            <Typography
                                variant="body2"
                                style={{ marginBottom: '10px' }}
                            >
                                {sentence.content}
                            </Typography>
                            <Box
                                display="flex"
                                flexWrap="wrap"
                                justifyContent="center"
                            >
                                {sentence.words.map((word, index) => (
                                    <Chip
                                        key={index}
                                        label={word}
                                        onClick={e => handleWordClick(e, word)}
                                        color="primary"
                                    />
                                ))}
                            </Box>
                        </>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowDetails(!showDetails)}
                        style={{ marginTop: '20px' }}
                    >
                        {showDetails ? 'HIDE' : 'SHOW'}
                    </Button>
                    {word && (
                        <VocabularyViewer
                            word={word}
                            wordAddedToNote={() => {}}
                            modalStyle={modalStyle}
                            open={true}
                            onClose={() => setWord('')}
                        ></VocabularyViewer>
                    )}
                </Box>
            </Container>
        )
    )
}

export default SentenceCheckComponent
