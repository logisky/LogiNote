import { Vocabulary1 } from '@loginote/types'
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
                        console.log('Database connected')
                        db = dictDb
                        resolve(dictDb)
                    }
                }
            )
        })
    })
}

export async function getVocabulary(v: string): Promise<Vocabulary1 | null> {
    return new Promise((resolve, reject) => {
        if (!db) {
            console.log('Database not initialized')
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
                console.log(row)
                resolve(row)
            }
        )
    })
}

// const db = new sqlite.Database('../../resources/dict/stardict', err => {
//     if (err) {
//         console.error('error opening database', err.message)
//     } else {
//         console.log('opened the database successfully')
//     }
// })
