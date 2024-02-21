export interface VocabularyNode {
    word: string
    references: SentenceId[]
}

export interface DailyProgress {
    date: string
    newWords: string[]
    sentences: SentenceId[]
    updatedSetIds: number[]
    goodExprIds: number[]
    articles: string[]
}

export interface TotalProgress {
    dateList: string[]
    words: number
    sentences: number
    sets: number
    articles: number
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

export interface SpelledLike {
    id: SpelledLikeId
    words: string[]
}

export type SentenceId = number
export type PartOfSpeech = string
export type SpelledLikeId = number
export type MeansLikeId = number

export interface VocabularySet {
    setId: number
    words: string[]
    description: string
}

export interface GoodExpression {
    goodExpId: number
    words: string[]
    references: SentenceId
}

export interface Sentence {
    id: SentenceId
    content: string
    translation: string
    words: string[]
    source?: Source
}

export interface Source {
    filePath: string
    highlightArea?: HighlightArea
}

// Copy from @react-pdf-viewer
export interface HighlightArea {
    height: number
    left: number
    pageIndex: number
    top: number
    width: number
}

export interface NotebookMetadata {
    words: number
    days: number
    files: number
    sentences: number
    vocabularySets: number
    createdDate: string
}

export interface ErrorMessage {
    err_msg: string
}

export interface RootLogiNote {
    createdDate: string
    sentenceId: number
    setId: number
}
