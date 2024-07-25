import { SuccessMsg } from '../shared/msg-error'
import { CustomError, NotFoundError } from '../types_backend/movies'
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

const prisma = new PrismaClient()

type TCommentsObj = {
    id: number
    author_username: string
    date: Date
    content: string
}
export async function apiGetComments(req: Request, res: Response) {
    try {
        let comments = await prisma.comment.findMany({
            take: 30,
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
        if (!comments) {
            res.status(200).json({})
            return
        }
        const commentsObj: TCommentsObj[] = []
        for (const elem of comments) {
            const newComment: TCommentsObj = {
                id: elem.id,
                author_username: elem.user.username,
                date: elem.createdAt,
                content: elem.text,
            }
            commentsObj.push(newComment)
        }
        res.status(200).json(commentsObj)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else res.status(400).send('Error with request')
    }
}

export async function apiGetOneComment(req: Request, res: Response) {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('empty argument')
        const numID = parseInt(id)
        if (isNaN(numID)) throw new CustomError('incorrect ID format')

        let comment = await prisma.comment.findUnique({
            where: {
                id: numID,
            },
            include: {
                user: true,
                movie: true,
            },
        })
        if (!comment) throw new NotFoundError('Comment not found')
        const commentsObj: TCommentsObj = {
            id: comment.id,
            author_username: comment.user.username,
            date: comment.createdAt,
            content: comment.text,
        }
        res.status(200).json(commentsObj)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else if (error instanceof NotFoundError) res.status(404).send(`Error: ${error.message}`)
        else res.status(400).send('Error with request')
    }
}

export async function apiPatchComment(req: Request, res: Response) {
    try {
        const { id } = req.params
        const { username, comment } = req.body
        if (!username && !comment) throw new CustomError('empty arguments')
        if (!id) throw new CustomError('empty argument')
        const numID = parseInt(id)
        if (isNaN(numID)) throw new CustomError('incorrect ID format')
        let commentDB = await prisma.comment.findUnique({
            where: {
                id: numID,
            },
        })
        if (!commentDB) throw new NotFoundError('no comment found with this ID')

        if (username !== undefined && username.trim() !== '') {
            //verif username exists
            const user = await prisma.user.findUnique({
                where: {
                    username: username,
                },
            })
            if (!user) throw new NotFoundError('username not found')

            //amend username
            await prisma.comment.update({
                where: {
                    id: numID,
                },
                data: {
                    userId: user.id,
                },
            })
        }

        if (comment !== undefined && comment.trim() !== '') {
            await prisma.comment.update({
                where: {
                    id: numID,
                },
                data: {
                    text: comment,
                },
            })
        }

        res.status(200).json(SuccessMsg)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else if (error instanceof NotFoundError) res.status(404).send(`Error: ${error.message}`)
        else res.status(400).send('Error with request')
    }
}

export async function apiDeleteComment(req: Request, res: Response) {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('empty argument')
        const numID = parseInt(id)
        if (isNaN(numID)) throw new CustomError('incorrect ID format')
        let commentDB = await prisma.comment.findUnique({
            where: {
                id: numID,
            },
        })
        if (!commentDB) throw new NotFoundError('no comment found with this ID')

        await prisma.comment.delete({
            where: {
                id: numID,
            },
        })

        res.status(200).json(SuccessMsg)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else if (error instanceof NotFoundError) res.status(404).send(`Error: ${error.message}`)
        else res.status(400).send('Error with request')
    }
}

export async function apiPostComment(req: Request, res: Response) {
    try {
        const { movie_id, comment } = req.body
        if (!movie_id) throw new CustomError('empty argument')
        const numID = parseInt(movie_id)
        if (isNaN(numID)) throw new CustomError('incorrect ID format')
        let movie = await prisma.movies.findUnique({
            where: {
                id: numID,
            },
        })
        if (!movie) throw new NotFoundError('no movie found with this ID')

        //check if we can link the comment to one user
        const userID: number = await findIDUserExisting()

        //post comment
        await prisma.comment.create({
            data: {
                text: comment,
                userId: userID,
                movieId: movie_id,
            },
        })

        res.status(200).json(SuccessMsg)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else if (error instanceof NotFoundError) res.status(404).send(`Error: ${error.message}`)
        else res.status(400).send('Error with request')
    }
}

async function findIDUserExisting(): Promise<number> {
    try {
        let found: boolean = false

        const users = await prisma.user.findMany({
            take: 1,
        })
        if (!users) throw new NotFoundError('no user found to add the comment')
        if (users.length === 0) throw new NotFoundError('no user found to add the comment')
        return users[0].id
    } catch (error) {
        throw new NotFoundError('no user found to add the comment')
    }
}
