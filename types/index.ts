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

export interface FileInfo {
    name: string
    urlPath: string
}

export interface FileNode {
    file: string
    sentences: SentenceId[]
}

export interface Vocabulary {
    vocabulary0: Vocabulary0 | null
    vocabulary1: StarDictVocabulary | null
}

// dictionaryapi
export interface Vocabulary0 {
    word: string
    phonetics: Phonetic[]
    meanings: Meaning[]
    spelledLike: string[]
}

// stardict
export interface Vocabulary1 {
    word: string
    phonetic: string
    tag: string
    definition: string
    translation: string
    exchange: string
    bnc: number
    frq: number
}

// A parsed and easy-handled format for frontend
export interface StarDictVocabulary {
    word: string
    phonetic: string
    definitions: string[]
    translations: string[]
    tags: string[]
    exchange: string[]
    bnc: number
    frq: number
}

export interface Phonetic {
    text: string
    audio: string
}

export interface Meaning {
    partOfSpeech: string
    definitions: Definition[]
}

export interface Definition {
    definition: string
    example: string
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
    highlightAreas: HighlightArea[]
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
