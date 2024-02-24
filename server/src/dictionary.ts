import * as path from 'path'
import * as SpellChecker from 'simple-spellchecker'

export let dictionary: any = null

const dictionaryPath = path.join(
    __dirname,
    '../../node_modules/simple-spellchecker/dict'
)

SpellChecker.getDictionary('en-US', dictionaryPath, (err: any, result: any) => {
    if (!err) {
        dictionary = result
    } else {
        console.log(`path: ${__dirname}`)
        console.error(err)
    }
})

export function checkSpellDebug(word: string): boolean {
    const r = checkSpell(word)
    console.log(`checking: ${word}, result: ${r}`)
    return r
}

export function checkSpell(word: string): boolean {
    if (word.length === 1 && word != 'a') return false
    if (word.match(/^[A-Z]+$/)) return true
    if (dictionary) {
        return dictionary.spellCheck(word.toLowerCase())
    }
    console.log('dictionary is null')
    return false
}
