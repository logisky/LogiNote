import React, { useState, useEffect, MouseEvent } from 'react'
import { Button, Chip } from '@material-ui/core'
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
            <div>
                <p>{sentence.translation}</p>
                {showDetails && (
                    <>
                        <p>{sentence.content}</p>
                        <div>
                            {sentence.words.map((word, index) => (
                                <Chip
                                    key={index}
                                    label={word}
                                    onClick={e => handleWordClick(e, word)}
                                />
                            ))}
                        </div>
                    </>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? '隐藏细节' : '显示所有内容'}
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
            </div>
        )
    )
}

export default SentenceCheckComponent
