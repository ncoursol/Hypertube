import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export async function oathToken(req: Request, res: Response) {
    const { client, secret } = req.body

    if (!(client && secret)) {
        res.status(400).json({ message: 'client or secret not defined' })
        return
    }
    if (!(secret === process.env.API_SECRET && client === process.env.API_CLIENT)) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }
    const api_token = process.env.API_TOKEN ? process.env.API_TOKEN : ''
    const token = jwt.sign({ user: 'OK' }, api_token)
    res.status(200).json({ access_token: token })
}
