import {
    Sentence,
    DailyProgress,
    VocabularySet,
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
    '.metadata',
]

export class DataManager {
    // abs path
    private _noteDirectory: string = ''
    private _loginote: RootLogiNote = {
        createdDate: '',
        sentenceId: 0,
        setId: 0,
    }

    private _todayProgress: DailyProgress = {
        date: getCurrentDateString(),
        newWords: [],
        sentences: [],
        updatedSetIds: [],
        goodExprIds: [],
        articles: [],
    }

    private _dateRandomSentences: Map<string, SentenceId[]> = new Map()
    private _fileRandomSenetences: Map<string, SentenceId[]> = new Map()

    public getUploadPath(): string {
        return path.join(this._noteDirectory, 'files')
    }

    public async setNoteDirectory(dir: string): Promise<TotalProgress | null> {
        this._noteDirectory = dir
        const loginoteFilePath = path.join(
            this._noteDirectory,
            '.metadata',
            '.loginote'
        )

        try {
            if (!fs.existsSync(loginoteFilePath)) {
                await this.initializeDirectories()
            }
            const data = await fs.promises.readFile(loginoteFilePath, 'utf8')
            const note = JSON.parse(data) as RootLogiNote
            this._loginote = note
            return this.getTotalProgress()
        } catch (error) {
            console.error(error)
            return null
        }
    }

    public async getFiles(): Promise<FileInfo[]> {
        try {
            const directoryPath = path.join(this._noteDirectory, 'files')
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
                this._noteDirectory,
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

                total.articles += progress.articles.length ?? 0
                total.sets += progress.updatedSetIds.length ?? 0
                total.sentences += progress.sentences.length ?? 0
                total.words += progress.newWords.length ?? 0

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
        const loginoteFilePath = path.join(
            this._noteDirectory,
            '.metadata',
            '.loginote'
        )
        await fs.promises.writeFile(
            loginoteFilePath,
            JSON.stringify(this._loginote, null, 2),
            'utf8'
        )
    }

    private async initializeDirectories(): Promise<void> {
        for (const dir of SUB_DIRECTORIES) {
            const dirPath = path.join(this._noteDirectory, dir)
            if (!fs.existsSync(dirPath)) {
                await fs.promises.mkdir(dirPath, { recursive: true })
            }
        }
        const loginoteFilePath = path.join(
            this._noteDirectory,
            '.metadata',
            '.loginote'
        )
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
            this._noteDirectory,
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
            this._noteDirectory,
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

    getFile2(name: string): Buffer | null {
        const filePath = path.join(this._noteDirectory, 'files', `${name}`)
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath)
        }
        return null
    }

    getFilePath(name: string): string {
        const filePath = path.join(this._noteDirectory, 'files', `${name}`)

        if (process.platform === 'win32')
            return `file:///${filePath.replace(/\\/g, '/')}`

        return `file://${filePath}`
    }

    upload(filePath: string): string | null {
        try {
            const basename = path.basename(filePath)
            const newFilePath = path.join(this.getUploadPath(), basename)
            fs.copyFileSync(filePath, newFilePath)
            return basename
        } catch (error) {
            console.error(error)
            return null
        }
    }

    getFileExists(name: string): boolean {
        const filePath = path.join(this._noteDirectory, 'files', `${name}`)
        return fs.existsSync(filePath)
    }

    async postVocabulary(vocabulary: Vocabulary): Promise<boolean> {
        return this.saveData(
            'vocabularies',
            vocabulary?.vocabulary0?.word ?? '',
            vocabulary
        ).then(valid => {
            if (!valid) return false
            this._todayProgress.newWords.push(
                vocabulary?.vocabulary0?.word ?? ''
            )
            this.flushProgress()
            return true
        })
    }

    async getVocabulary(word: string): Promise<Vocabulary | null> {
        return this.loadData<Vocabulary>('vocabularies', word)
    }

    async postSentence(sentence: Sentence): Promise<boolean> {
        if (sentence.id < 0) sentence.id = this._loginote.sentenceId

        return this.saveData(
            'sentences',
            sentence.id.toString(),
            sentence
        ).then(async valid => {
            if (!valid) return false
            if (this._loginote.sentenceId == sentence.id) {
                this._loginote.sentenceId += 1
                await this.flushNote()
            }
            // Set vocabulary nodes
            sentence.words.forEach(async w => {
                await this.addVocabularyNode(w, [sentence.id])
            })

            // Set file nodes
            if (sentence.source) {
                const path = sentence.source.filePath
                this.getFileNode(path).then(async v => {
                    const node: FileNode = v ?? {
                        file: path,
                        sentences: [],
                    }
                    node.sentences.push(sentence.id)
                    await this.postFileNode(node)
                })
            }

            this._todayProgress.sentences.push(sentence.id)
            await this.flushProgress()
            return true
        })
    }

    async getVocabularySet(setId: number): Promise<VocabularySet | null> {
        return this.loadData<VocabularySet>('vocabularies', setId.toString())
    }

    async postVocabularySet(set: VocabularySet): Promise<boolean | null> {
        if (set.setId < 0) set.setId = this._loginote.setId
        return this.saveData('vocabulary_sets', set.setId.toString(), set).then(
            valid => {
                if (!valid) return false
                if (this._loginote.setId == set.setId) {
                    this._loginote.setId += 1
                    this.flushNote()
                }
                this._todayProgress.updatedSetIds.push(set.setId)
                this.flushProgress()
                return true
            }
        )
    }

    async getVocabularyNode(word: string): Promise<VocabularyNode | null> {
        return this.loadData<VocabularyNode>('vocabularies_node', word)
    }

    async getDateRandomSentenceId(date: string): Promise<SentenceId> {
        if (date === '') {
            // unimlemented now
            return -1
        }
        const sentences = this._dateRandomSentences.get(date)
        if (sentences && sentences.length > 0) {
            const result = sentences[0]
            this._dateRandomSentences.set(date, sentences.slice(1))
            return result
        }

        const progress = this.getDailyProgress(date)
        return progress
            .then(p => {
                if (!p || p.sentences.length === 0) return -1

                const sentences = shuffleArray(Array.from(p.sentences))
                const result = sentences.shift() as number
                this._dateRandomSentences.set(date, sentences)
                return result
            })
            .catch(_e => {
                return -1
            })
    }

    async getFileRandomSentenceId(file: string): Promise<SentenceId> {
        const sentences = this._fileRandomSenetences.get(file)
        if (sentences && sentences.length > 0) {
            const result = sentences.shift() as number
            this._fileRandomSenetences.set(file, sentences)
            return result
        }

        const newSensentences = this.getFileSentences(file)
        return newSensentences
            .then(f => {
                if (!f || f.length === 0) return -1

                const sentences = shuffleArray(f).map(f => f.id)
                const result = sentences.shift() as number
                this._fileRandomSenetences.set(file, sentences)
                return result
            })
            .catch(_e => {
                return -1
            })
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
        const cleaned: DailyProgress = {
            date: this._todayProgress.date,
            newWords: Array.from(new Set(this._todayProgress.newWords)),
            sentences: Array.from(new Set(this._todayProgress.sentences)),
            updatedSetIds: Array.from(
                new Set(this._todayProgress.updatedSetIds)
            ),
            goodExprIds: Array.from(new Set(this._todayProgress.goodExprIds)),
            articles: Array.from(new Set(this._todayProgress.articles)),
        }
        this._todayProgress = cleaned
        return this.saveData(
            'daily_progresses',
            this._todayProgress.date,
            this._todayProgress
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

function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length,
        temporaryValue,
        randomIndex

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    }

    return array
}
