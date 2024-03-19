import { ipcMain } from 'electron'
import { DataFetcher, setAccessToken } from './data_fetcher'
import { DataManager } from './data_manager'
import { SentenceId, Vocabulary } from '@loginote/types'
import { cleanText2 } from './clean_text2'

const dataManager = new DataManager()
const dataFetcher = new DataFetcher()

ipcMain.handle('open', async (_e, directoryPath: string) => {
    const result = await dataManager.setNoteDirectory(directoryPath)
    return result
})

ipcMain.handle('getVocabularies', async (_e, word: string) => {
    const vocabulary = await dataManager.getVocabulary(word)
    return vocabulary
})

ipcMain.handle('postVocabularies', async (_e, vocabulary) => {
    const success = await dataManager.postVocabulary(vocabulary)
    return success
})

ipcMain.handle('getSentence', async (_e, sentenceId) => {
    const sentence = await dataManager.getSentence(Number(sentenceId))
    return sentence
})

ipcMain.handle('getSentences', async (_e, ids: SentenceId[]) => {
    if (ids.length == 0) return null

    const sentences = await dataManager.getSentences(ids)
    return sentences
})

ipcMain.handle('postSentence', async (_e, sentence) => {
    const success = await dataManager.postSentence(sentence)
    return success
})

ipcMain.handle('getVocabularySet', async (_e, setId) => {
    const vocabularySet = await dataManager.getVocabularySet(Number(setId))
    return vocabularySet
})

ipcMain.handle('postVocabularySet', async (_e, set) => {
    const success = await dataManager.postVocabularySet(set)
    return success
})

ipcMain.handle('getDailyProgress', async (_e, date) => {
    const dailyProgress = await dataManager.getDailyProgress(date)
    return dailyProgress
})

ipcMain.handle('getTotalProgress', async _e => {
    const total = await dataManager.getTotalProgress()
    return total
})

ipcMain.handle('getVocabularyNdoe', async (_e, word) => {
    const node = await dataManager.getVocabularyNode(word)
    return node
})

ipcMain.handle('getFile', async (_e, name) => {
    const buffer = dataManager.getFile2(name)
    return buffer
})

ipcMain.handle('getFiles', async _e => {
    return dataManager.getFiles()
})

ipcMain.handle('postFile', async (_e, filePath) => {
    return dataManager.upload(filePath)
})

ipcMain.handle('exists', async (_e, fileName) => {
    return dataManager.getFileExists(fileName)
})

ipcMain.handle('getFileSentences', async (_e, name) => {
    return await dataManager.getFileSentences(name)
})

ipcMain.handle('translate', async (_e, sentence) => {
    const result = await dataFetcher.translate(sentence)
    return result
})

ipcMain.handle('searchVocabulary', async (_e, word) => {
    const v0 = await dataFetcher.fetchVocabulary0(word)
    const v1 = await dataFetcher.fetchVocabulary1(word)
    const result: Vocabulary = { vocabulary0: v0, vocabulary1: v1 }
    return result
})

ipcMain.handle('searchStarDict', async (_e, word) => {
    return await dataFetcher.fetchVocabulary1(word)
})

ipcMain.handle('randomSentenceDate', async (_e, date) => {
    return dataManager.getDateRandomSentenceId(date)
})

ipcMain.handle('randomSentenceFile', async (_e, file) => {
    return dataManager.getFileRandomSentenceId(file)
})

ipcMain.handle('clean', async (_e, sentence) => {
    return cleanText2(sentence)
})

ipcMain.handle('getFilePath', async (_e, name) => {
    return dataManager.getFilePath(name)
})

export function setBaiduToken(s: string) {
    setAccessToken(s)
}
