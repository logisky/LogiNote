import { Vocabulary0, Vocabulary1 } from '@loginote/types'
import {
    getVocabulary,
    hasIntializedDatabase,
    initializeDatabase,
} from './dictionary2'

var ACCESS_TOKEN = ''

process.on('message', (value: string) => {
    console.log('receive: ', value)
    ACCESS_TOKEN = value
})

export class DataFetcher {
    public constructor() {
        initializeDatabase()
    }

    public async translate(text: string): Promise<string> {
        const url = `https://aip.baidubce.com/rpc/2.0/mt/texttrans-with-dict/v1?access_token=${ACCESS_TOKEN}`
        console.log(url)
        try {
            const result = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    from: 'en',
                    to: 'zh',
                }),
                headers: { 'Content-type': 'application/json' },
            })
            console.log(result.body)
            const r: { result: any } = await result.json()
            console.log(r)
            return (r.result.trans_result[0].dst as string) ?? ''
        } catch (e) {
            console.error(e)
            return ''
        }
    }

    public async fetchVocabulary1(s: string): Promise<Vocabulary1 | null> {
        if (!hasIntializedDatabase()) {
            await initializeDatabase()
        }
        return getVocabulary(s)
    }

    public async fetchVocabulary0(s: string): Promise<Vocabulary0 | null> {
        const word = s.trim().toLowerCase()
        try {
            const vocabulary = this._fetchBasicInfo(word)

            const spelledLike = this._fetchSpelledLike(word)

            const result = await Promise.all([vocabulary, spelledLike])

            const r = result[0]

            if (!r) return null
            r.spelledLike = result[1]

            return r
        } catch (e) {
            console.error(e)
            return null
        }
    }

    private async _fetchBasicInfo(word: string): Promise<Vocabulary0 | null> {
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

        const data: Vocabulary0[] = await resp.json()
        if (data.length === 0) return null
        return data[0] as Vocabulary0
    }

    private async _fetchSpelledLike(word: string): Promise<string[]> {
        const resp = await fetch(
            `https://api.datamuse.com/words?sp=${word}&max=3`,
            {
                headers: { 'Content-type': 'application/json' },
            }
        )
        if (!resp.ok) {
            console.error(`Error fetching synonyms: ${resp.statusText}`)
            return []
        }
        const data: WordInfo[] = await resp.json()
        // The fist spelled like is itself
        return data.map(d => d.word).slice(1)
    }
}

interface WordInfo {
    word: string
}

export default DataFetcher
