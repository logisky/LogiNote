import { StarDictVocabulary, Vocabulary1 } from '@loginote/types'
import sqlite3 from 'sqlite3'

export let db: sqlite3.Database | undefined

export function hasIntializedDatabase(): boolean {
    return db !== undefined
}

export function initializeDatabase(): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
        import('sqlite3').then((sqlite3: any) => {
            const sqlite: sqlite3.sqlite3 = sqlite3.verbose()
            const dictDb = new sqlite.Database(
                './resources/dict/stardict.db',
                err => {
                    if (err) {
                        console.error('error opening database', err.message)
                        reject(err)
                    } else {
                        db = dictDb
                        resolve(dictDb)
                    }
                }
            )
        })
    })
}

export async function getVocabulary(
    v: string,
    depth = 0
): Promise<StarDictVocabulary | null> {
    return new Promise((resolve, reject) => {
        if (!db) {
            console.error('Database not initialized')
            return reject('Database not initialized')
        }
        db.get(
            `SELECT * FROM stardict WHERE word = ?`,
            [v],
            (err, row: Vocabulary1) => {
                if (err) {
                    console.error('Error querying database:', err.message)
                    resolve(null)
                }
                // Lemma is found, returnning the lemma result.
                // Should not involve the dead loop here, but to be safe, use the `depth`
                // to prevent this situation. Since the dictionary is large
                if (
                    depth === 0 &&
                    row &&
                    row.exchange &&
                    row.exchange.includes('0:')
                ) {
                    const regex = /0:([a-zA-Z]+)/
                    const matches = row.exchange.match(regex)
                    if (matches) {
                        return resolve(getVocabulary(matches[1], 1))
                    }
                }
                if (!row) {
                    console.log('no such vocabulary: ' + v)
                    resolve(null)
                }
                const result = convertVocabulary(row)
                resolve(result)
            }
        )
    })
}

function convertVocabulary(v: Vocabulary1): StarDictVocabulary {
    const tags = v.tag ? v.tag.split(' ') : []
    const definitions = v.definition
        ? v.definition
              .split('\n')
              .filter(n => n)
              .map(n => n.trim())
        : []
    const translations = v.translation
        ? v.translation
              .split('\n')
              .filter(n => n)
              .map(n => n.trim())
        : []
    return {
        word: v.word,
        phonetic: v.phonetic ?? '',
        definitions,
        translations,
        bnc: v.bnc,
        frq: v.frq,
        exchange: parseExchange(v.exchange),
        tags,
    }
}

function parseExchange(s: string): string[] {
    const result: string[] = []
    const pairs = s.split('/')
    for (const pair in pairs) {
        if (!pair) continue
        const keyValue = pair.split(':')
        if (keyValue.length === 0 || !keyValue[1]) continue
        // const key = keyValue[0].trim()
        const value = keyValue[1].trim()
        result.push(value)
    }
    return result
}
