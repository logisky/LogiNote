import {
    DailyProgress,
    Sentence,
    SentenceId,
    Vocabulary,
    VocabularySet,
} from '@loginote/types'

const BASE_URL = 'http://localhost:3001'

class ApiClient {
    static async getVocabularySet(setId: number): Promise<VocabularySet> {
        return fetch(`${BASE_URL}/vs/${setId}`)
            .then(response => response.json())
            .catch(error => console.error('Error fetching sentence:', error))
    }

    static async addVocabularySet(vs: VocabularySet): Promise<number> {
        return fetch(`${BASE_URL}/vs/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vs }),
        })
            .then(response => response.json())
            .catch(error =>
                console.error('Error adding vocabulary set:', error)
            )
    }

    static async postDailyProgress(dp: DailyProgress): Promise<void> {
        return fetch(`${BASE_URL}/dp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dp }),
        })
            .then(response => response.json())
            .catch(error =>
                console.error('Error posting the daily progress:', error)
            )
    }

    static async removeVocabularySet(setId: number): Promise<void> {
        return fetch(`${BASE_URL}/vs/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setId: setId }),
        })
            .then(response => response.json())
            .catch(error =>
                console.error('Error removing vocabulary set:', error)
            )
    }

    static async addVocabulariesToSet(
        words: string[],
        setId: number
    ): Promise<void> {
        return fetch(`${BASE_URL}/vs/add_members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setId: setId, words: words }),
        })
            .then(response => response.json())
            .catch(error =>
                console.error('Error adding membership into set:', error)
            )
    }

    static async removeVocabulariesToSet(
        words: string[],
        setId: number
    ): Promise<void> {
        return fetch(`${BASE_URL}/vs/remove_members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setId: setId, words: words }),
        })
            .then(response => response.json())
            .catch(error =>
                console.error('Error removing membershit from set:', error)
            )
    }

    static async getSentence(sentenceId: SentenceId): Promise<Sentence> {
        return fetch(`${BASE_URL}/sentences/${sentenceId}`)
            .then(response => response.json())
            .catch(error => console.error('Error fetching sentence:', error))
    }

    static async addSentence(sentence: Sentence): Promise<SentenceId> {
        return fetch(`${BASE_URL}/sentences/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sentence }),
        })
            .then(response => response.json())
            .catch(error => console.error('Error adding sentence:', error))
    }

    static async updateSentence(sentence: Sentence): Promise<SentenceId> {
        return fetch(`${BASE_URL}/sentences/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sentence }),
        })
            .then(response => response.json())
            .catch(error => console.error('Error updating sentence:', error))
    }

    static async getVocabulary(word: string): Promise<Vocabulary> {
        return fetch(`${BASE_URL}/vocabulary/${word}`)
            .then(response => response.json())
            .catch(error => console.error('Error fetching vocabulary:', error))
    }

    static async updateVocabulary(vocabulary: Vocabulary): Promise<void> {
        return fetch(`${BASE_URL}/vocabulary/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vocabulary),
        })
            .then(response => response.json())
            .catch(error => console.error('Error updating vocabulary:', error))
    }

    static async addVocabulary(vocabulary: Vocabulary): Promise<void> {
        return fetch(`${BASE_URL}/vocabulary/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vocabulary),
        })
            .then(response => response.json())
            .catch(error => console.error('Error adding vocabulary:', error))
    }
}

export default ApiClient
