import { getVocabulary, initializeDatabase, db } from './dictionary2'

describe('dictionary2 test', () => {
    beforeAll(async () => {
        await initializeDatabase()
    })
    it('1', async () => {
        const a = await getVocabulary('abandon')
        console.log(a)
    })
    afterAll(() => {
        db?.close()
    })
})
