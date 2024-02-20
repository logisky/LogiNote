import React, {useState} from 'react'
import {HighlightArea} from '@loginote/types'
import translate from 'google-translate-api'

interface HighlightSentenceViewerProps {
    sentence: string
    data: HighlightArea
}

const HighlightSentenceViewer: React.FC<HighlightSentenceViewerProps> = ({ sentence, data }) => {
    const [translation, setTranslateion] = useState<string>('')

    translate(sentence, {to: 'zh'}).then(res => {
        setTranslateion(res.text)
    })

    const addSentenceToNotebook = async () => {
        try {
            if (translation === '') {
                throw new Error('Cannot add an untranslated sentence into the notebook. since this may suggest there would be something wrong in the sentence')
            }
            const response = await fetch('/api/sentences/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sentence,
                    translation,
                    data,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to add sentence to notebook')
            }

            await response.json()
        } catch (error: any) {
            console.error('Error adding sentence to notebook:', error)
        }
    }

    return (
        <div>
            <p>
                <strong>Sentence:</strong> {sentence}
            </p>
            <p>
                <strong>Translation:</strong> {translation}
            </p>
            <button onClick={addSentenceToNotebook}>
                Add Sentence to Notebook
            </button>
        </div>
    )
}

export default HighlightSentenceViewer
