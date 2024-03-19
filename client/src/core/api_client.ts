import {
    DailyProgress,
    Sentence,
    SentenceId,
    Vocabulary,
    VocabularyNode,
    VocabularySet,
    TotalProgress,
    FileInfo,
} from '@loginote/types'

const ipcRenderer = window.electron.ipcRenderer

class ApiClient {
    static async openDirectory(
        directoryPath: string
    ): Promise<TotalProgress | null> {
        return ipcRenderer.invoke('open', directoryPath)
    }

    static async getVocabulary(word: string): Promise<Vocabulary | null> {
        return ipcRenderer.invoke('getVocabularies', word)
    }

    static async postVocabulary(vocabulary: Vocabulary): Promise<void> {
        return ipcRenderer.invoke('postVocabularies', vocabulary)
    }

    static async getSentence(sentenceId: SentenceId): Promise<Sentence | null> {
        return ipcRenderer.invoke('getSentence', sentenceId)
    }

    static async getSentences(ids: SentenceId[]): Promise<Sentence[]> {
        return ipcRenderer.invoke('getSentences', ids)
    }

    static async postSentence(sentence: Sentence) {
        return ipcRenderer.invoke('postSentence', sentence)
    }

    static async getVocabularySet(setId: number) {
        return ipcRenderer.invoke('getVocabularySet', setId)
    }

    static async postVocabularySet(vocabularySet: VocabularySet) {
        return ipcRenderer.invoke('postVocabularySet', vocabularySet)
    }

    static async getDailyProgress(date: string): Promise<DailyProgress | null> {
        return ipcRenderer.invoke('getDailyProgress', date)
    }

    static async getVocabularyNode(word: string): Promise<VocabularyNode> {
        return ipcRenderer.invoke('getVocabularyNode', word)
    }

    static async getTotalProgress(): Promise<TotalProgress | null> {
        return ipcRenderer.invoke('getTotalProgress')
    }

    static async getFiles(): Promise<FileInfo[]> {
        return ipcRenderer.invoke('getFiles')
    }

    static async getFile(name: string): Promise<Buffer | void> {
        return ipcRenderer.invoke('getFile', name)
    }

    static async getFileSentences(p: string): Promise<Sentence[]> {
        return ipcRenderer.invoke('getFileSentences', p)
    }

    static async getFileExists(file: string): Promise<boolean> {
        return ipcRenderer.invoke('exists', file)
    }

    static async translate(sentence: string): Promise<string> {
        return ipcRenderer.invoke('translate', sentence)
    }

    static async clean(sentence: string): Promise<string> {
        return ipcRenderer.invoke('clean', sentence)
    }

    static async searchVocabulary(word: string): Promise<Vocabulary> {
        return ipcRenderer.invoke('searchVocabulary', word)
    }

    static async getDateRandomSentence(date: string): Promise<SentenceId> {
        return ipcRenderer.invoke('randomSentenceDate', date)
    }

    static async getFileRandomSentence(file: string): Promise<SentenceId> {
        return ipcRenderer.invoke('randomSentenceFile', file)
    }

    static async postFile(file: string): Promise<string | null> {
        return ipcRenderer.invoke('postFile', file)
    }

    static async getFilePath(p: string): Promise<string> {
        return ipcRenderer
            .invoke('getFile', p)
            .then((r: Buffer) => {
                const blob = new Blob([r], { type: 'application/pdf' })
                const fileUrl = URL.createObjectURL(blob)
                return fileUrl
            })
            .catch((e: string) => {
                console.error(e)
                return ''
            })
    }
}

export default ApiClient
