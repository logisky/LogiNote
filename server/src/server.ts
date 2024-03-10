import express from 'express'
import cors from 'cors'
import DataManager from './data_manager'
import multer from 'multer'
import DataFetcher from './data_fetcher'
import { Vocabulary } from '@loginote/types'
import { cleanText2 } from './clean_text2'

const app = express()
const port = 3001

app.use(express.json())
app.use(
    cors({
        origin: 'http://localhost:3000',
    })
)

const dataManager = new DataManager()
const dataFetcher = new DataFetcher()

const fileStorage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        const path = dataManager.getUploadPath()
        callback(null, path)
    },
    filename: (_req, file, callback) => {
        const fileName = file.originalname
        callback(null, fileName)
    },
})

const upload = multer({ storage: fileStorage })

app.post('/open', async (req, res) => {
    const { directoryPath } = req.body
    const result = await dataManager.setNoteDirectory(directoryPath)

    if (!result) {
        res.status(500).json({
            err_mst: `Cannot open the directory: ${directoryPath}`,
        })
    } else {
        res.json(result)
    }
})

app.get('/vocabularies/:word', async (req, res) => {
    const { word } = req.params
    const vocabulary = await dataManager.getVocabulary(word)
    vocabulary
        ? res.json(vocabulary)
        : res.status(404).json({ message: 'Vocabulary not found' })
})

app.post('/vocabularies', async (req, res) => {
    const success = await dataManager.postVocabulary(req.body)
    success
        ? res.status(201).json({ message: 'Vocabulary added successfully' })
        : res.status(500).json({ message: 'Failed to add vocabulary' })
})

app.get('/sentences/:sentenceId', async (req, res) => {
    const { sentenceId } = req.params
    const sentence = await dataManager.getSentence(Number(sentenceId))
    sentence
        ? res.json(sentence)
        : res.status(404).json({ message: 'Sentence not found' })
})

app.get('/sentences', async (req, res) => {
    const ids = req.query.ids as string

    if (!ids) {
        return res.status(400).json({ message: 'No sentence IDs provided' })
    }

    const sentenceIds: number[] = ids
        .split(',')
        .map(id => Number(id))
        .filter(id => !isNaN(id) && Number.isFinite(id))

    if (sentenceIds.length === 0) {
        return res
            .status(400)
            .json({ message: 'Invalid sentence IDs provided' })
    }

    const sentences = await dataManager.getSentences(sentenceIds)

    if (sentences && sentences.length > 0) {
        res.json(sentences)
    } else {
        res.status(404).json({ message: 'Sentences not found' })
    }
})

app.post('/sentence', async (req, res) => {
    const success = await dataManager.postSentence(req.body)
    success
        ? res.status(201).json({ message: 'Sentence added successfully' })
        : res.status(500).json({ message: 'Failed to add sentence' })
})

app.get('/vocabulary_sets/:setId', async (req, res) => {
    const { setId } = req.params
    const vocabularySet = await dataManager.getVocabularySet(Number(setId))
    vocabularySet
        ? res.json(vocabularySet)
        : res.status(404).json({ message: 'Vocabulary set not found' })
})

app.post('/vocabulary_sets', async (req, res) => {
    const success = await dataManager.postVocabularySet(req.body)
    success
        ? res.status(201).json({ message: 'Vocabulary set added successfully' })
        : res.status(500).json({ message: 'Failed to add vocabulary set' })
})

app.get('/daily_progresses/:date', async (req, res) => {
    const { date } = req.params
    const dailyProgress = await dataManager.getDailyProgress(date)
    dailyProgress
        ? res.json(dailyProgress)
        : res.status(404).json({ message: 'Daily progress not found' })
})

app.get('/daily_progress', async (_, res) => {
    const total = await dataManager.getTotalProgress()
    total
        ? res.json(total)
        : res.status(404).json({ message: 'Daily progress not found' })
})

app.get('/vocabulary_nodes/:word', async (req, res) => {
    const { word } = req.params
    const node = await dataManager.getVocabularyNode(word)
    node
        ? res.json(node)
        : res.status(404).json({ message: 'Daily progress not found' })
})

app.get('/file/:name', async (req, res) => {
    const { name } = req.params
    const stream = dataManager.getFile(name)
    if (stream) {
        res.setHeader('Content-Type', 'application/pdf')
        stream.pipe(res)
    } else {
        res.status(400).send('no file')
    }
})

app.get('/files', async (_, res) => {
    const files = await dataManager.getFiles()
    res.json(files)
})

app.post('/file', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json(req.file.filename)
    } else {
        res.status(400).send('no file uploaded')
    }
})

app.get('/exists/:name', async (req, res) => {
    const { name } = req.params
    const v = dataManager.getFileExists(name)
    res.json(v)
})

app.get('/file_sentences/:name', async (req, res) => {
    const { name } = req.params
    const sentences = await dataManager.getFileSentences(name)
    res.json(sentences)
})

app.post('/translate', async (req, res) => {
    const { sentence } = req.body
    const result = await dataFetcher.translate(sentence)
    console.log('translate result' + result)
    if (result) res.json(result)
    else res.status(400).send('translate failed')
})

app.get('/search/vocabulary/:word', async (req, res) => {
    const { word } = req.params
    const v0 = await dataFetcher.fetchVocabulary0(word)
    const v1 = await dataFetcher.fetchVocabulary1(word)
    const result: Vocabulary = { vocabulary0: v0, vocabulary1: v1 }
    res.json(result)
})

app.get('/search/stardict/:word', async (req, res) => {
    const { word } = req.params
    const v1 = await dataFetcher.fetchVocabulary1(word)
    res.json(v1)
})

app.get('/random_sentence/:date', async (req, res) => {
    const { date } = req.params
    const result = await dataManager.getRandomSentenceId(date)
    res.json(result)
})

app.post('/clean', async (req, res) => {
    const { sentence } = req.body
    const result = cleanText2(sentence)
    res.json(result)
})

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})
