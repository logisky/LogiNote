import { checkSpell } from './dictionary'

export function cleanText(sentence: string, debug = false): string {
    console.log('before clean:')
    console.log(sentence)
    // Only 1 space between words in correct sentence
    const parts = sentence.split(/[,.;*?!？！=]+/)
    let result = ''
    parts.forEach((v, i) => {
        console.log(`part: ${v}`)
        const r = cleanPart(v, debug)
        if (i === 0) {
            result = `${r}`
        } else {
            result += `, ${r}`
        }
    })
    return result
}

export function cleanPart(part: string, debug = false): string {
    const parts = part.split(/\s+/)
    const filtered = filter(parts)
    console.log(filtered)
    const merge1 = tryMerge(filtered, false, debug)
    const merge2 = tryMerge(merge1, true, debug)
    const r = merge2.join(' ')
    console.log('after clean:')
    console.log(r)
    return r
}

function filter(input: string[]): string[] {
    const result: string[] = []
    input.forEach(e => {
        if (e && e.trim() !== '') {
            result.push(e)
        }
    })
    return result
}

function tryMerge(words: string[], soft: boolean, debug = false): string[] {
    const check = checkSpell
    let result: string[] = []
    const wrongIdx: Set<number> = new Set()
    for (let i = 0; i < words.length; i += 1) {
        const w = words[i]

        if (check(w)) {
            if (shortProbablyWrong(w)) {
                if (i > 0 && words[i - 1].endsWith(w)) {
                    continue
                }

                if (i < words.length - 1 && words[i + 1].startsWith(w)) {
                    continue
                }

                if (i < words.length - 1 && i > 0 && soft) {
                    if (wrongIdx.has(i - 1)) {
                        const newWord = `${result[result.length - 1]}${w}`
                        if (check(newWord)) {
                            wrongIdx.delete(i - 1)
                            result.push(newWord)
                        }
                        continue
                    }
                }
            }
            result.push(w)
            continue
        }

        if (i > 0 && wrongIdx.has(i - 1)) {
            const newWord = `${words[i - 1]}${w}`
            if (check(newWord)) {
                result.push(newWord)
                continue
            }
        }

        if (result.length > 0 && result[result.length - 1].endsWith(w)) {
            continue
        }
        if (i < words.length - 1 && words[i + 1].startsWith(w)) {
            continue
        }

        if (i > 0 && soft && result.length > 0) {
            const newWord = `${result[result.length - 1]}${w}`
            if (check(newWord)) {
                result.push(newWord)
                continue
            }
        }

        if (i < words.length - 1 && soft) {
            const newWord = `${w}${words[i + 1]}`
            if (check(newWord)) {
                result.push(newWord)
                i += 1
                continue
            }
        }

        wrongIdx.add(i)
        result.push(w)
    }

    findContinuousSequences(wrongIdx).forEach((vals: number[]) => {
        if (vals.length <= 1) {
            return
        }
        let newWord = ''
        vals.forEach((idx, j) => {
            newWord += result[idx]
            if (j > 0) {
                result[idx] = ''
            }
        })
        result[vals[0]] = newWord
    })
    return result.filter(v => v !== '')
}

function findContinuousSequences(nums: Set<number>): number[][] {
    const sortedNums = Array.from(nums).sort((a, b) => a - b)
    const sequences: number[][] = []
    let tempSequence: number[] = []

    for (let i = 0; i < sortedNums.length; i++) {
        if (i === 0 || sortedNums[i] === sortedNums[i - 1] + 1) {
            tempSequence.push(sortedNums[i])
        } else {
            if (tempSequence.length > 0) {
                sequences.push(tempSequence)
            }
            tempSequence = [sortedNums[i]]
        }
    }

    if (tempSequence.length > 0) {
        sequences.push(tempSequence)
    }

    return sequences
}

function shortProbablyWrong(word: string): boolean {
    if (word.length > 2) return false
    if (word.toUpperCase() === word) return false
    if (word === 'a' || word === 'an') return false

    return true
}
