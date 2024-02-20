import React, { useState, useEffect } from 'react'
import ApiClient from '../core/api_client'
import { Sentence, SentenceId } from '@loginote/types'

interface SentenceViewerProps {
    sentenceId: SentenceId
}

const SentenceViewer: React.FC<SentenceViewerProps> = ({ sentenceId }) => {
    const [sentence, setSentence] = useState<Sentence | null>(null)

    useEffect(() => {
        ApiClient.getSentence(sentenceId)
            .then(setSentence)
            .catch(error => console.error('Error fetching sentence:', error))
    }, [sentenceId])

    const highlightWords = (content: string, words: string[]) => {
        let highlightedContent = content
        words.forEach(word => {
            const highlight = `<span style="background-color: yellow;">${word}</span>`
            highlightedContent = highlightedContent.replace(
                new RegExp(`\\b${word}\\b`, 'gi'),
                highlight
            )
        })
        return { __html: highlightedContent }
    }

    if (!sentence) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h3>Sentence</h3>
            <p
                dangerouslySetInnerHTML={highlightWords(
                    sentence.content,
                    sentence.words
                )}
            ></p>
            <p>
                <strong>Translation:</strong> {sentence.translation}
            </p>
            {sentence.words.length > 0 && (
                <p>
                    <strong>Words:</strong> {sentence.words.join(', ')}
                </p>
            )}
            {sentence.source && (
                <div>
                    <p>
                        <strong>Source:</strong> {/* 展示来源信息 */}
                    </p>
                </div>
            )}
        </div>
    )
}

export default SentenceViewer
