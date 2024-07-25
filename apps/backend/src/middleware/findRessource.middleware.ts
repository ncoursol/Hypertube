import { CommentPrisma } from '../shared/comment'
import { requestWithRessource } from '../shared/request'
import { PrismaClient } from '@prisma/client'
import { NextFunction, Response } from 'express'

const prisma = new PrismaClient()

export const findComment = async (req: requestWithRessource, res: Response, next: NextFunction) => {
    const { commentId } = req.params

    const comment: CommentPrisma | null = await prisma.comment.findUnique({
        where: {
            id: parseInt(commentId),
        },
        select: {
            id: true,
            text: true,
            updatedAt: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    profile_picture: true,
                },
            },
        },
    })

    if (!comment) {
        res.status(400).send('invalidCommentId')
        return
    }

    req.comment = comment
    next()
}
