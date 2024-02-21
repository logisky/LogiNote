import {
    DailyProgress,
    Sentence,
    SentenceId,
    Vocabulary,
    VocabularyNode,
    VocabularySet,
} from '@loginote/types'

class ApiClient {
    static BASE_URL = 'http://localhost:3001'

    static async openDirectory(directoryPath: string) {
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

    static async postSentence(sentence: Sentence) {
        return this.makeRequest('/sentences', 'POST', sentence)
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

    static async makeRequest<T>(
        path: string,
        method: string,
        body: any = null
    ): Promise<T> {
        try {
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
}

export default ApiClient
