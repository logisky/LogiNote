// import * as path from 'path'
// import * as SpellChecker from 'simple-spellchecker'

// export let dictionary: any = null

// const dictionaryPath = path.join(
//     __dirname,
//     '../../node_modules/simple-spellchecker/dict'
// )

// SpellChecker.getDictionary('en-US', dictionaryPath, (err: any, result: any) => {
//     if (!err) {
//         dictionary = result
//     } else {
//         console.log(`path: ${__dirname}`)
//         console.error(err)
//     }
// })

export function checkSpell(word: string): boolean {
    return true
}
