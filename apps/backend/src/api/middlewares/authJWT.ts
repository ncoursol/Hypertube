import { Request, Response } from 'express'

const jwt = require('jsonwebtoken')

export const authenticateJWT = (req: Request, res: Response, next: any) => {
    console.log('coming to authentificate, auth=' + req.header('Authorization'))
    const token = req.header('Authorization')?.replace('Bearer ', '')
    console.log('token: ' + token)

    if (!token) return res.status(401).json({ message: 'Unauthorized' })

    jwt.verify(token, process.env.API_TOKEN, (err: any, user: any) => {
        if (err) return res.status(403).json({ message: 'Invalid token' })
        req.user = user
        next()
    })
}
