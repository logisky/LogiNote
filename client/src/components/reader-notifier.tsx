import { ReactElement, createContext, FC, useState, useContext } from 'react'
import { HighlightSentenceViewerProps } from './highlight-sentence-viewer'
const NotifierContext = createContext({
    page: '',
    sentenceData: null as HighlightSentenceViewerProps | null,
    setActiveTab: (tab: string) => {},
    setHighlightData: (data: HighlightSentenceViewerProps) => {},
})

interface PageNotifierProps {
    children: ReactElement | ReactElement[]
}

export const PageNotifier: FC<PageNotifierProps> = ({ children }) => {
    const [page, setPage] = useState('notes')
    const [sentenceData, setSentenceData] =
        useState<null | HighlightSentenceViewerProps>(null)
    return (
        <NotifierContext.Provider
            value={{
                page,
                sentenceData,
                setActiveTab: setPage,
                setHighlightData: setSentenceData,
            }}
        >
            {children}
        </NotifierContext.Provider>
    )
}

export const useNotifierContext = () => useContext(NotifierContext)
