import {
    Vocabulary,
    Sentence,
    DailyProgress,
    VocabularySet,
    NotebookMetadata,
    ErrorMessage,
    RootLogiNote,
    SentenceId,
    VocabularyNode,
} from '@loginote/types'
import fs from 'fs'
import path from 'path'

const SUB_DIRECTORIES = [
    'vocabulary_nodes',
    'vocabularies',
    'files',
    'sentences',
    'daily_progresses',
    'vocabulary_sets',
]

class DataManager {
    private noteDirectory: string = ''
    private loginote: RootLogiNote = {
        createdDate: '',
        sentenceId: 0,
        setId: 0,
    }

    private todayProgress = {
        date: getCurrentDateString(),
        newWords: new Set<string>(),
        sentences: new Set<SentenceId>(),
        updatedSetIds: new Set<number>(),
        goodExprIds: new Set<number>(),
        articles: new Set<string>(),
    }

    public async setNoteDirectory(
        dir: string
    ): Promise<NotebookMetadata | ErrorMessage> {
        this.noteDirectory = dir
        const loginoteFilePath = path.join(this.noteDirectory, '.loginote')

        try {
            if (!fs.existsSync(loginoteFilePath)) {
                await this.initializeDirectories()
            }
            return this.getNotebookMetadata()
        } catch (error) {
            const result: ErrorMessage = {
                err_msg: `Failed to open the directory: ${this.noteDirectory}, error: ${error}`,
            }
            return result
        }
    }

    private async getNotebookMetadata(): Promise<NotebookMetadata> {
        const data = await this.loadData<RootLogiNote>('.', '.loginote')
        if (data) this.loginote = data

        const metadata: NotebookMetadata = {
            words: 0,
            files: 0,
            days: 0,
            sentences: 0,
            vocabularySets: 0,
            createdDate: data?.createdDate ?? '',
        }

        for (const dir of SUB_DIRECTORIES) {
            const dirPath = path.join(this.noteDirectory, dir)
            if (fs.existsSync(dirPath)) {
                const files = await fs.promises.readdir(dirPath)
                switch (dir) {
                    case 'vocabularies':
                        metadata.words = files.length
                        break
                    case 'files':
                        metadata.files = files.length
                        break
                    case 'sentences':
                        metadata.sentences = files.length
                        break
                    case 'daily_progresses':
                        metadata.days = files.length
                        break
                    case 'vocabulary_sets':
                        metadata.vocabularySets = files.length
                        break
                    default:
                }
            }
        }

        return metadata
    }

    private async flushNote(): Promise<void> {
        if (this.loginote) this.saveData('.', '.loginote', this.loginote)
    }

    private async initializeDirectories(): Promise<void> {
        for (const dir of SUB_DIRECTORIES) {
            const dirPath = path.join(this.noteDirectory, dir)
            if (!fs.existsSync(dirPath)) {
                await fs.promises.mkdir(dirPath, { recursive: true })
            }
        }
        const loginoteFilePath = path.join(this.noteDirectory, '.loginote')
        if (!fs.existsSync(loginoteFilePath)) {
            const ln: RootLogiNote = {
                createdDate: getCurrentDateString(),
                sentenceId: 0,
                setId: 0,
            }
            await fs.promises.writeFile(
                loginoteFilePath,
                JSON.stringify(ln, null, 2),
                'utf8'
            )
        }
    }

    private async saveData(
        folder: string,
        fileName: string,
        data: any
    ): Promise<boolean> {
        const filePath = path.join(
            this.noteDirectory,
            folder,
            `${fileName}.json`
        )
        try {
            await fs.promises.writeFile(
                filePath,
                JSON.stringify(data, null, 2),
                'utf8'
            )
            return true
        } catch (error) {
            console.error(`Error writing file ${filePath}:`, error)
            return false
        }
    }

    private async loadData<T>(
        folder: string,
        fileName: string
    ): Promise<T | null> {
        const filePath = path.join(
            this.noteDirectory,
            folder,
            `${fileName}.json`
        )
        try {
            const data = await fs.promises.readFile(filePath, 'utf8')
            return JSON.parse(data) as T
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error)
            return null
        }
    }

    async saveFile(name: string, file: Buffer): Promise<boolean> {
        return this.saveData('files', name, file)
    }

    async getFile(name: string): Promise<Buffer | null> {
        return this.loadData<Buffer>('files', name)
    }

    async postVocabulary(vocabulary: Vocabulary): Promise<boolean> {
        return this.saveData('vocabularies', vocabulary.word, vocabulary).then(
            valid => {
                if (!valid) return false
                this.todayProgress.newWords.add(vocabulary.word)
                this.flushProgress()
                return true
            }
        )
    }

    async getVocabulary(word: string): Promise<Vocabulary | null> {
        return this.loadData<Vocabulary>('vocabularies', word)
    }

    async postSentence(sentence: Sentence): Promise<boolean> {
        if (sentence.id < 0) sentence.id = this.loginote.sentenceId

        return this.saveData(
            'sentences',
            sentence.id.toString(),
            sentence
        ).then(valid => {
            if (!valid) return false
            if (this.loginote.sentenceId == sentence.id) {
                this.loginote.sentenceId + 1
                this.flushNote()
            }
            sentence.words.forEach(w => {
                this.addVocabularyNode(w, [sentence.id])
            })
            this.todayProgress.sentences.add(sentence.id)
            this.flushProgress()
            return true
        })
    }

    async getVocabularySet(setId: number): Promise<VocabularySet | null> {
        return this.loadData<VocabularySet>('vocabularies', setId.toString())
    }

    async postVocabularySet(set: VocabularySet): Promise<boolean | null> {
        if (set.setId < 0) set.setId = this.loginote.setId
        return this.saveData('vocabulary_sets', set.setId.toString(), set).then(
            valid => {
                if (!valid) return false
                if (this.loginote.setId == set.setId) {
                    this.loginote.setId + 1
                    this.flushNote()
                }
                this.todayProgress.updatedSetIds.add(set.setId)
                this.flushProgress()
                return true
            }
        )
    }

    async getVocabularyNode(word: string): Promise<VocabularyNode | null> {
        return this.loadData<VocabularyNode>('vocabularies_node', word)
    }

    async addVocabularyNode(
        word: string,
        sentenceIds: SentenceId[]
    ): Promise<boolean> {
        this.getVocabularyNode(word).then(v => {
            if (v) {
                const references = new Set<SentenceId>(v.references)
                sentenceIds.forEach(e => references.add(e))
                v.references = [...references]
                this.saveData('vocabulary_sets', word, v)
            } else {
                const r: VocabularyNode = {
                    word: word,
                    references: sentenceIds,
                }
                this.saveData('vocabulary_sets', word, r)
            }
        })
        return true
    }

    async getSentence(sentenceId: number): Promise<Sentence | null> {
        return this.loadData<Sentence>('sentences', sentenceId.toString())
    }

    async getDailyProgress(date: string): Promise<DailyProgress | null> {
        return this.loadData<DailyProgress>('daily_progresses', date)
    }

    async flushProgress(): Promise<boolean | null> {
        return this.saveData(
            'daily_progresses',
            this.todayProgress.date,
            this.todayProgress
        )
    }
}

const getCurrentDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
}

export default DataManager
