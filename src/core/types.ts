import { HighlightArea } from '@react-pdf-viewer/highlight'

export enum PartOfSpeech {
    Noun,
    Verb,
    Adjective,
    Adverb,
    Pronoun,
    Preposition,
    Conjunction,
    Determiner,
    Interjection,
}

export interface VocabularyNode {
    vocubulary: Vocabulary

    // relationship
    spellsLike: SpelledLikeId[]
    meansLike: MeansLikeId[]
    antonyms: string[]

    references: SentenceId[]
}

// Raw information of a vocabulary. Used in getting the raw data
export interface Vocabulary {
    word: string
    phonetics: Phonetic[]
    meanings: Meaning[]
    spelledLike: string[]
}

export interface Phonetic {
    text: string
    audio: string
}

export interface Meaning {
    definitions: Definition[]
}

export interface Definition {
    definition: string
    expample: string
    synonyms: string[]
    antonyms: string[]
}

export interface MeansLike {
    id: MeansLikeId
    words: string[]
    partOfSpeech: PartOfSpeech
}

export interface SpelledLike {
    id: SpelledLikeId
    words: string[]
}

export type SentenceId = string
export type SpelledLikeId = number
export type MeansLikeId = number

export interface GoodExpression {
    words: string[]
    references: SentenceId[]
}

export interface Sentence {
    id: SentenceId
    content: string
    translation: string
    source?: Source
}

export interface Source {
    filePath: string
    highlightArea?: HighlightArea
}
