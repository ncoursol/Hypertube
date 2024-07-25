import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

interface CustomError extends Error {
    error?: Joi.ValidationError
    details?: Joi.ValidationErrorItem[]
}

const globalErrorMiddleware = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (err.error instanceof Joi.ValidationError) {
        res.status(400).send('invalidInput')
        return
    } else {
        console.error(err.stack)
        return res.sendStatus(500)
    }
}

export default globalErrorMiddleware
