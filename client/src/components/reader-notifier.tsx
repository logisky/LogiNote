import { ReactElement, createContext, FC, useState, useContext } from 'react'
import { HighlightSentenceViewerProps } from './highlight-sentence-viewer'
import { Sentence, HighlightArea } from '@loginote/types'

const NotifierContext = createContext({
    page: '',
    sentenceData: null as HighlightSentenceViewerProps | null,
    sentences: [] as Sentence[],
    setActiveTab: (tab: string) => {},
    setHighlightData: (data: HighlightSentenceViewerProps) => {},
    setSentences: (sentences: Sentence[]) => {},

    jump: null as null | ((highlightArea: HighlightArea) => void),
    setJump: (p: null | ((highlightArea: HighlightArea) => void)) => {},
})

interface PageNotifierProps {
    children: ReactElement | ReactElement[]
}

export const PageNotifier: FC<PageNotifierProps> = ({ children }) => {
    const [page, setPage] = useState('notes')
    const [sentenceData, setSentenceData] =
        useState<null | HighlightSentenceViewerProps>(null)
    const [sentences, setSentences] = useState<Sentence[]>([])
    const [jump, setJump] = useState<null | ((ha: HighlightArea) => void)>(null)
    return (
        <NotifierContext.Provider
            value={{
                page,
                sentenceData,
                sentences,
                jump,
                setActiveTab: setPage,
                setHighlightData: setSentenceData,
                setSentences,
                setJump,
            }}
        >
            {children}
        </NotifierContext.Provider>
    )
}

export const useNotifierContext = () => useContext(NotifierContext)
