import { Request, Response, NextFunction } from 'express'
import fs from 'fs'

const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = new Date().getTime() // Record the start time

    let log: string[] = []

    // Log the request information
    log.push('NEW REQUEST =============================================>')
    log.push(`Time: ${new Date().toISOString()}`)
    log.push(`Route: ${req.method} ${req.originalUrl}`)
    log.push('Request Parameters:', JSON.stringify(req.params, null, 2))
    log.push('Request Body:', JSON.stringify(req.body, null, 2))

    // Intercept the original send function to capture response body
    const originalSend = res.send.bind(res)
    res.send = (body) => {
        try {
            // Parse the body to JSON and store it
            const jsonBody = JSON.parse(body)
            res.locals.responseBody = JSON.stringify(jsonBody, null, 2) // Beautify the JSON
        } catch (error) {
            // If body is not JSON, store it as is
            res.locals.responseBody = body
        }

        return originalSend(body)
    }

    // Continue processing the request
    next()

    // warn the response warnrmation
    res.on('finish', () => {
        const end = new Date().getTime() // Record the end time
        const duration = end - start // Calculate the duration

        // warn the response warnrmation
        log.push(`Response Status: ${res.statusCode}`)
        log.push(`Response Time: ${duration}ms`)
        log.push('Response Body:', res.locals.responseBody)

        // Handle error warnging
        if (res.statusCode >= 400) {
            log.push('Error:', res.statusMessage)
        }

        fs.appendFileSync('request.log', log.join('\n') + '\n\n')
    })
}

export default requestLoggerMiddleware
