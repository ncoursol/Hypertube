import { CommentDTO, CommentPrisma, MovieCommentPrisma } from '../shared/comment'
import { RequestWithUser, requestWithRessource } from '../shared/request'
import { formatComment } from '../utils/format'
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

const prisma = new PrismaClient()

export async function getComments(req: Request, res: Response) {
    // returns a list of latest comments which includes comment’s author username, date, content, and id
    const comments: CommentPrisma[] = await prisma.comment.findMany({
        take: 10,
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

    const formattedComments: CommentDTO[] = comments.map(formatComment)
    res.status(200).send(formattedComments)
}

export async function getComment(req: requestWithRessource, res: Response) {
    const formattedComment: CommentDTO = formatComment(req.comment!)
    res.status(200).send(formattedComment)
}

export async function updateComment(req: requestWithRessource, res: Response) {
    const { commentId } = req.params
    const { comment: newComment } = req.body

    await prisma.comment.update({
        where: {
            id: parseInt(commentId),
        },
        data: {
            text: newComment,
        },
    })

    req.comment!.text = newComment
    const formattedComment: CommentDTO = formatComment(req.comment!)
    res.status(200).send(formattedComment)
}

export async function deleteComment(req: Request, res: Response) {
    const { commentId } = req.params

    await prisma.comment.delete({
        where: {
            id: parseInt(commentId),
        },
    })

    res.status(200).send('commentDeleted')
}

export async function createComment(req: RequestWithUser, res: Response) {
    const { comment, imdbCode } = req.body

    const movie = await prisma.movies.findFirst({
        where: {
            imdb_code: imdbCode,
        },
    })

    if (!movie) {
        res.status(400).send('invalidMovieId')
        return
    }

    const dbComment: CommentPrisma = await prisma.comment.create({
        data: {
            text: comment,
            userId: req.user!.user_id,
            movieId: movie.id,
        },
        select: {
            id: true,
            text: true,
            updatedAt: true,
            user: {
                select: {
                    id: true,
                    profile_picture: true,
                    username: true,
                },
            },
        },
    })

    const formattedComment: CommentDTO = formatComment(dbComment)
    res.status(200).send(formattedComment)
}

export async function getMovieComments(req: Request, res: Response) {
    const { movieId } = req.params

    const movie: MovieCommentPrisma | null = await prisma.movies.findFirst({
        where: {
            imdb_code: movieId,
        },
        select: {
            id: true,
            comments: {
                select: {
                    id: true,
                    text: true,
                    updatedAt: true,
                    user: {
                        select: {
                            id: true,
                            profile_picture: true,
                            username: true,
                        },
                    },
                },
            },
        },
    })

    if (!movie) {
        res.status(400).send('invalidMovieId')
        return
    }

    const formattedComments: CommentDTO[] = movie.comments
        .map(formatComment)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    res.status(200).send(formattedComments)
}
