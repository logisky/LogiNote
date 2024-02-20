import React, { useEffect, useState } from 'react'
import { DataFetcher } from '../core/data'
import { Vocabulary, Phonetic, Meaning, Definition } from '@loginote/types'

interface VocabularyViewerProps {
    word: string
}

const VocabularyViewer: React.FC<VocabularyViewerProps> = ({ word }) => {
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

    return (
        vocabulary && (
            <div>
                <h2>{vocabulary.word}</h2>
                <div>
                    <h3>Phonetics:</h3>
                    {vocabulary.phonetics.length > 0 &&
                        vocabulary.phonetics.map(
                            (phonetic: Phonetic, index: number) => (
                                <div key={index}>
                                    <p>{phonetic.text}</p>
                                    {phonetic.audio && (
                                        <audio controls src={phonetic.audio}>
                                            Your browser does not support the
                                            audio element.
                                        </audio>
                                    )}
                                </div>
                            )
                        )}
                </div>
                <div>
                    <h3>Meanings:</h3>
                    {vocabulary.meanings.length > 0 &&
                        vocabulary.meanings.map(
                            (meaning: Meaning, index: number) => (
                                <div key={index}>
                                    {meaning.definitions.map(
                                        (
                                            definition: Definition,
                                            defIndex: number
                                        ) => (
                                            <div key={defIndex}>
                                                <p>
                                                    <b>Definition:</b>{' '}
                                                    {definition.definition}
                                                </p>
                                                {definition.expample && (
                                                    <p>
                                                        <b>Example:</b>{' '}
                                                        {definition.expample}
                                                    </p>
                                                )}
                                                {definition.synonyms.length >
                                                    0 && (
                                                    <p>
                                                        <b>Synonyms:</b>{' '}
                                                        {definition.synonyms.join(
                                                            ', '
                                                        )}
                                                    </p>
                                                )}
                                                {definition.antonyms.length >
                                                    0 && (
                                                    <p>
                                                        <b>Antonyms:</b>{' '}
                                                        {definition.antonyms.join(
                                                            ', '
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            )
                        )}
                </div>
                {vocabulary.spelledLike.length > 0 && (
                    <div>
                        <h3>Spelled Like:</h3>
                        <p>{vocabulary.spelledLike.join(', ')}</p>
                    </div>
                )}
            </div>
        )
    )
}

export default VocabularyViewer
