import express from 'express'
import DataManager from './data_manager'

const app = express()
const port = 3001

app.use(express.json())

const dataManager = new DataManager()

app.post('/open', async (req, res) => {
    const { directoryPath } = req.body
    const result = await dataManager.setNoteDirectory(directoryPath)

    if ('err_msg' in result) {
        res.status(500).json(result)
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

app.post('/sentences', async (req, res) => {
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

app.get('/daily_progress', async (req, res) => {
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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})
