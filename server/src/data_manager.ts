import {
    Vocabulary0,
    Sentence,
    DailyProgress,
    VocabularySet,
    NotebookMetadata,
    ErrorMessage,
    RootLogiNote,
    SentenceId,
    VocabularyNode,
    TotalProgress,
    FileInfo,
    Vocabulary,
    FileNode,
} from '@loginote/types'
import fs, { ReadStream } from 'fs'
import fsp from 'fs/promises'
import path from 'path'

const SUB_DIRECTORIES = [
    'vocabulary_nodes',
    'vocabularies',
    'files',
    'file_nodes',
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

    public getUploadPath(): string {
        return path.join(this.noteDirectory, 'files')
    }

    public async setNoteDirectory(dir: string): Promise<TotalProgress | null> {
        this.noteDirectory = dir
        const loginoteFilePath = path.join(this.noteDirectory, '.loginote')

        try {
            if (!fs.existsSync(loginoteFilePath)) {
                await this.initializeDirectories()
            }
            return this.getTotalProgress()
        } catch (error) {
            console.error(error)
            return null
        }
    }

    public async getFiles(): Promise<FileInfo[]> {
        try {
            const directoryPath = path.join(this.noteDirectory, 'files')
            console.log(directoryPath)
            const files = await fsp.readdir(directoryPath)
            return files
                .filter(f => f.endsWith('.pdf'))
                .map(f => {
                    return { name: f, urlPath: path.join(directoryPath, f) }
                })
        } catch (error) {
            return []
        }
    }

    public async getTotalProgress(): Promise<TotalProgress | null> {
        try {
            const directoryPath = path.join(
                this.noteDirectory,
                'daily_progresses'
            )
            const files = await fsp.readdir(directoryPath)
            const total: TotalProgress = {
                dateList: [],
                words: 0,
                sentences: 0,
                sets: 0,
                articles: 0,
            }
            const dates = []

            for (const file of files) {
                const filePath = path.join(directoryPath, file)
                const content = await fsp.readFile(filePath, 'utf8')
                const progress: DailyProgress = JSON.parse(content)
                console.log(progress)

                total.articles += progress.articles.size ?? 0
                total.sets += progress.updatedSetIds.size ?? 0
                total.sentences += progress.sentences.size ?? 0
                total.words += progress.newWords.size ?? 0

                dates.push(progress.date)
            }

            total.dateList = dates
            return total
        } catch (error) {
            console.error('Error summarizing daily progresses:', error)
            return null
        }
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

    async getFileNode(file: string): Promise<FileNode | null> {
        return this.loadData<FileNode>('file_nodes', file)
    }

    async postFileNode(node: FileNode): Promise<boolean> {
        return this.saveData('file_nodes', node.file, node)
            .then(_v => {
                return true
            })
            .catch(e => {
                console.error(e)
                return false
            })
    }

    async getFileSentences(file: string): Promise<Sentence[]> {
        return this.getFileNode(file)
            .then(value => {
                if (!value) {
                    return []
                }

                return this.getSentences(value.sentences)
                    .then(sentences => {
                        return sentences ?? []
                    })
                    .catch(e => {
                        console.error(e)
                        return []
                    })
            })
            .catch(e => {
                console.error(e)
                return []
            })
    }

    getFile(name: string): ReadStream | null {
        const filePath = path.join(this.noteDirectory, 'files', `${name}`)
        if (fs.existsSync(filePath)) {
            return fs.createReadStream(filePath)
        }
        return null
    }

    getFileExists(name: string): boolean {
        const filePath = path.join(this.noteDirectory, 'files', `${name}`)
        return fs.existsSync(filePath)
    }

    async postVocabulary(vocabulary: Vocabulary): Promise<boolean> {
        return this.saveData(
            'vocabularies',
            vocabulary?.vocabulary0?.word ?? '',
            vocabulary
        ).then(valid => {
            if (!valid) return false
            this.todayProgress.newWords.add(vocabulary?.vocabulary0?.word ?? '')
            this.flushProgress()
            return true
        })
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
            // Set vocabulary nodes
            sentence.words.forEach(w => {
                this.addVocabularyNode(w, [sentence.id])
            })

            // Set file nodes
            if (sentence.source) {
                const path = sentence.source.filePath
                this.getFileNode(path).then(v => {
                    const node: FileNode = v ?? {
                        file: path,
                        sentences: [],
                    }
                    node.sentences.push(sentence.id)
                    this.postFileNode(node)
                })
            }

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

    async getSentences(sentenceIds: number[]): Promise<Sentence[] | null> {
        const sentences = await Promise.all(
            sentenceIds.map(id =>
                this.loadData<Sentence>('sentences', id.toString())
            )
        )

        const validSentences = sentences.filter(sentence => sentence !== null)

        if (validSentences.length === 0) {
            return null
        }

        return validSentences as Sentence[]
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
