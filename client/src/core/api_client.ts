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

class ApiClient {
    static BASE_URL = 'http://localhost:3001'

    static async openDirectory(
        directoryPath: string
    ): Promise<TotalProgress | null> {
        return this.makeRequest('/open', 'POST', { directoryPath })
    }

    static async getVocabulary(word: string): Promise<Vocabulary | null> {
        return this.makeRequest(`/vocabularies/${word}`, 'GET')
    }

    static async postVocabulary(vocabulary: Vocabulary): Promise<void> {
        return this.makeRequest('/vocabularies', 'POST', vocabulary)
    }

    static async getSentence(sentenceId: SentenceId): Promise<Sentence | null> {
        return this.makeRequest(`/sentences/${sentenceId}`, 'GET')
    }

    static async getSentences(ids: SentenceId[]): Promise<Sentence[]> {
        const queryParam = `ids=${ids.join(',')}`
        return this.makeRequest(`/sentences?${queryParam}`, 'GET')
    }

    static async postSentence(sentence: Sentence) {
        return this.makeRequest('/sentence', 'POST', sentence)
    }

    static async getVocabularySet(setId: number) {
        return this.makeRequest(`/vocabulary_sets/${setId}`, 'GET')
    }

    static async postVocabularySet(vocabularySet: VocabularySet) {
        return this.makeRequest('/vocabulary_sets', 'POST', vocabularySet)
    }

    static async getDailyProgress(date: string): Promise<DailyProgress | null> {
        return this.makeRequest(`/daily_progresses/${date}`, 'GET')
    }

    static async getVocabularyNode(word: string): Promise<VocabularyNode> {
        return this.makeRequest(`/vocabulary_nodes/${word}`, 'GET')
    }

    static async getTotalProgress(): Promise<TotalProgress | null> {
        return this.makeRequest('/daily_progress', 'GET')
    }

    static async getFiles(): Promise<FileInfo[]> {
        return this.makeRequest('/files', 'GET')
    }

    static async getFile(name: string): Promise<Blob | void> {
        return fetch(`${this.BASE_URL}/file/${name}`, {
            headers: {
                'Content-Type': 'application/pdf',
            },
        })
            .then(response => response.blob())
            .catch(error => console.error('Error fetching PDF', error))
    }

    static async getFileSentences(p: string): Promise<Sentence[]> {
        return this.makeRequest(`/file_sentences/${p}`, 'GET')
    }

    static async getFileExists(file: string): Promise<boolean> {
        return this.makeRequest(`/exists/${file}`, 'GET')
    }

    static async translate(sentence: string): Promise<string> {
        return this.makeRequest(`/translate`, 'POST', { sentence })
    }

    static async clean(sentence: string): Promise<string> {
        return this.makeRequest(`/clean`, 'POST', { sentence })
    }

    static async searchVocabulary(word: string): Promise<Vocabulary> {
        return this.makeRequest(`/search/vocabulary/${word}`, 'GET')
    }

    static async getRandomSentence(date: string): Promise<SentenceId> {
        return this.makeRequest(`/random_sentence/${date}`, 'GET')
    }

    static async makeRequest<T>(
        path: string,
        method: string,
        body: any = null
    ): Promise<T> {
        try {
            console.log(`${this.BASE_URL}${path}}`)
            const response = await fetch(`${this.BASE_URL}${path}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : null,
            })
            return response.json()
        } catch (error) {
            console.error(`Error with the request to ${path}:`, error)
            throw error
        }
    }

    static getFilePath(p: string): string {
        return `${this.BASE_URL}/file/${p}`
    }
}

export default ApiClient
