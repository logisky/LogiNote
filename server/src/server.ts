import express, { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const app = express()
const port = 3001

const notesDirectory = process.argv[2]
checkNoteDirectory(notesDirectory).then(isValid => {
    if (isValid) {
        console.log('The note directory is valid.')
    } else {
        console.error('The note directory is invalid.')
        process.exit(1)
    }
})

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})

async function checkNoteDirectory(dirPath: string): Promise<boolean> {
    const loginoteFilePath = path.join(dirPath, '.loginote')

    try {
        const loginoteFileExists = fs.existsSync(loginoteFilePath)

        if (loginoteFileExists) {
            return true
        } else {
            const files = await fs.promises.readdir(dirPath)
            if (files.length === 0) {
                await fs.promises.writeFile(loginoteFilePath, '')
                return true
            } else {
                console.error(
                    `The directory at ${dirPath} is not empty and lacks a .loginote file.`
                )
                return false
            }
        }
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            await fs.promises.mkdir(dirPath, { recursive: true })
            await fs.promises.writeFile(loginoteFilePath, '')
            return true
        } else {
            console.error(
                `An error occurred while checking the directory: ${error.message}`
            )
            return false
        }
    }
}
