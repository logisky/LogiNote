import { Vocabulary } from './types'

interface WordInfo {
    word: string
}

const DATAMUSE = 'https://api.datamuse.com'

export class DataFetcher {
    public static async fetchVocabulary(s: string): Promise<Vocabulary | null> {
        const word = s.trim()
        const vocabulary = this._fetchBasicInfo(word)

        const spelledLike = this._fetchSpelledLike(word)

        const result = await Promise.all([vocabulary, spelledLike])

        const r = result[0]

        if (!r) return null
        r.spelledLike = result[1]

        return r
    }

    private static async _fetchBasicInfo(
        word: string
    ): Promise<Vocabulary | null> {
        const resp = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
            {
                headers: { 'Content-type': 'application/json' },
            }
        )
        console.log(resp)
        if (!resp.ok) {
            console.error(`Error fetching basic info: ${resp.statusText}`)
            return null
        }

        const data: Vocabulary[] = await resp.json()
        if (data.length == 0) return null
        return data[0] as Vocabulary
    }

    private static async _fetchSpelledLike(word: string): Promise<string[]> {
        const resp = await fetch(`${DATAMUSE}/words?sp=${word}&max=3`, {
            headers: { 'Content-type': 'application/json' },
        })
        if (!resp.ok) {
            console.error(`Error fetching synonyms: ${resp.statusText}`)
            return []
        }
        const data: WordInfo[] = await resp.json()
        // The fist spelled like is itself
        return data.map(d => d.word).slice(1)
    }
}
