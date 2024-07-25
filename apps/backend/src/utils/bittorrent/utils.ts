import crypto from 'crypto'
import fs from 'fs'

let id: Buffer | null = null

const redColor = '\x1b[31m'
const greenColor = '\x1b[32m'
const yellowColor = '\x1b[33m'
const purpleColor = '\x1b[35m'
const resetColor = '\x1b[0m'

export const genId = () => {
    if (!id) {
        id = crypto.randomBytes(20)
        Buffer.from('-HT0001-').copy(id, 0)
    }
    return id
}

export const log = (status: boolean, address: string, port: number, message: string) => {
    if (process.env.DEBUG !== 'True') return
    // Current time in HH:MM:SS format
    const now = new Date()

    const hhmmss = new Date().toTimeString().split(' ')[0]
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0')
    const time = `${hhmmss}.${milliseconds}`

    const logMessage = `${yellowColor}${address}:${purpleColor}${port} [${time}] ${
        status ? greenColor + ': ✓' : redColor + ': ✗'
    } ${message}${resetColor}\n`

    // Write to log.ans file
    fs.appendFileSync('log.ans', logMessage)
}
