import { cleanText } from './clean_text'
import { cleanText2, windowScan } from './clean_text2'
import { checkSpell, dictionary } from './dictionary'

describe('clean text', () => {
    beforeEach(async () => {
        while (!dictionary) {
            await sleep(1000)
        }
    })
    it('1', async () => {
        const text =
            'The primary ca u se of global w arming is hu man activ it y,speci call cally the b bu burning of fossil fu els su ch as oil and coal'
        const result2 = cleanText2(text)
        console.log(result2)
    })
    it('window scan test1', () => {
        const words = ['su', 'ch', 'fuel', 's']
        const center = 1
        const size = 2
        const result = windowScan(words, new Set(), center, size)
        console.log(result)
    })
    it('window scan test2', () => {
        const words = ['b', 'bu', 'burning']
        const center = 1
        const size = 3
        const result = windowScan(words, new Set([0, 1]), center, size)
        console.log(result)
        console.log(checkSpell('specially'))
    })
})

function sleep(mill: number) {
    return new Promise(resolve => setTimeout(resolve, mill))
}
