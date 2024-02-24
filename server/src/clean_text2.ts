import { checkSpell } from './dictionary'

export function cleanText2(sentence: string): string {
    // Only 1 space between words in correct sentence
    const parts = sentence.split(/[,.;*?!？！=]+/)
    let result = ''
    parts.forEach((v, i) => {
        console.log(`part: ${v}`)
        const r = rebuildSentenceWithDroppingWords(v)
        if (i === 0) {
            result = `${r}`
        } else {
            result += `, ${r}`
        }
    })
    return result
}

function rebuildSentenceWithDroppingWords(sentence: string): string {
    const droppable = (idx: number, words: string[]): boolean => {
        const w = words[idx]
        if (idx > 0 && words[idx - 1].endsWith(w)) return true
        if (idx < words.length - 1 && words[idx + 1].startsWith(w)) return true
        return false
    }

    const words = sentence.split(' ')
    console.log(words)
    const drops = new Set<number>()
    let wrongIdx: number[] = []

    words.forEach((w, i) => {
        if (!checkSpell(w) || words[i].length <= 2) {
            wrongIdx.push(i)
        }
        if (droppable(i, words)) {
            drops.add(i)
            wrongIdx.push(i)
        }
    })

    let windowSize = 4
    const corrected = new Map<number, [number[], string]>()
    const hasMatch = new Set<number>()
    while (wrongIdx.length > 0 && windowSize >= 2) {
        const nextWrongIdx: number[] = []
        wrongIdx.forEach(widx => {
            if (hasMatch.has(widx)) {
                return
            }
            const result = windowScan(words, drops, widx, windowSize)
            if (result[0].length > 0) {
                corrected.set(result[0][0], result)
                for (
                    let i = result[0][0];
                    i <= result[0][result[0].length - 1];
                    i += 1
                ) {
                    hasMatch.add(i)
                }
            } else {
                nextWrongIdx.push(widx)
            }
        })
        windowSize -= 1
        wrongIdx = nextWrongIdx
    }

    let i = 0
    const s: string[] = []
    while (i < words.length) {
        const r = corrected.get(i)
        if (r) {
            s.push(r[1])
            i = r[0].pop() as number
        } else {
            s.push(words[i])
        }
        i += 1
    }
    return s.join(' ')
}

export function windowScan(
    words: string[],
    droppable: Set<number>,
    center: number,
    size: number
): [number[], string] {
    const leftmost = Math.max(center - size + 1, 0)
    const rightmost = Math.min(center + size - 1, words.length - 1)

    const possibility: [number[], string][] = []
    for (let i = leftmost; i + size - 1 <= rightmost; i += 1) {
        const drops = []
        for (let j = 0; j < size; j += 1) {
            const idx = i + j
            if (droppable.has(idx)) {
                drops.push(j)
            }
        }
        const newWord = words.slice(i, i + size).join('')
        console.log(center, i, size, newWord, drops)
        if (checkSpell(newWord)) {
            const r = Array.from({ length: size }, (_, k) => i + k)
            return [r, newWord]
        }

        if (drops.length === 0) {
            continue
        }

        const cnt = 1 << drops.length
        for (let c = 0; c < cnt; c += 1) {
            const combination: boolean[] = []
            for (let l = 0; l < drops.length; l += 1) {
                combination.push(Boolean(c & (1 << l)))
            }

            let newWord = ''
            const result = []
            for (let j = 0; j < size; j += 1) {
                if (droppable.has(i + j)) {
                    const d = combination.pop()
                    if (d === undefined) {
                        throw Error('')
                    }
                    if (!d) {
                        newWord += words[i + j]
                        result.push(i + j)
                    } else {
                        if (
                            j < size - 1 &&
                            words[i + j + 1].startsWith(words[i + j])
                        ) {
                            if (result.length === 0) {
                                result.push(i + j)
                            }
                        } else if (
                            j > 0 &&
                            words[i + j - 1].endsWith(words[i + j])
                        ) {
                            if (result.length === 0) {
                                result.push(i + j)
                            }
                        } else {
                            newWord += words[i + j]
                            result.push(i + j)
                        }
                    }
                } else {
                    newWord += words[i + j]
                    result.push(i + j)
                }
            }

            console.log(newWord)
            if (newWord && checkSpell(newWord)) {
                console.log('add to possibility', result)
                possibility.push([result, newWord])
            }
        }
    }

    console.log(possibility)
    if (possibility.length === 0) return [[], '']
    if (possibility.length === 1) return possibility[0]

    let wordLen = 0
    let currIdx = 0
    for (let n = 0; n < possibility.length; n += 1) {
        if (possibility[n][1].length > wordLen) {
            currIdx = n
            wordLen = possibility[n][1].length
        }
    }
    return possibility[currIdx]
}
