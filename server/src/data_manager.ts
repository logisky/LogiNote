import { Vocabulary } from '@loginote/types'
import fs from 'fs'
import path from 'path'

class DataManager {
    private noteDirectory: string

    constructor(noteDirectory: string) {
        this.noteDirectory = noteDirectory
    }

    async findVocabulary(word: string): Promise<Vocabulary | null> {
        const filePath = path.join(this.noteDirectory, `${word}.json`)
        try {
            const data = await fs.promises.readFile(filePath, 'utf8')
            return JSON.parse(data) as Vocabulary
        } catch (error) {
            console.error(`Error reading file ${filePath}: ${error}`)
            return null
        }
    }

    async addVocabulary(vocabulary: Vocabulary): Promise<boolean> {
        const filePath = path.join(
            this.noteDirectory,
            `${vocabulary.word}.json`
        )
        try {
            await fs.promises.writeFile(
                filePath,
                JSON.stringify(vocabulary, null, 2),
                'utf8'
            )
            return true
        } catch (error) {
            console.error(`Error writing file ${filePath}: ${error}`)
            return false
        }
    }
}

export default DataManager
