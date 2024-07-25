import 'dotenv/config'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token =
        req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token

    if (!token) {
        return res.status(403).send({ error: 'A token is required for authentication' })
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY || '')
        req.user = decoded
    } catch (err) {
        return res.status(401).send({ error: 'Invalid Token' })
    }
    return next()
}

export default verifyToken
