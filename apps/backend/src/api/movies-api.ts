import { SuccessMsg } from '../shared/msg-error'
import { CustomError, NotFoundError } from '../types_backend/movies'
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

const prisma = new PrismaClient()

export async function apiGetMovies(req: Request, res: Response) {
    try {
        let movies = await prisma.movies.findMany({
            take: 20,
            select: {
                id: true,
                title: true,
            },
        })
        if (!movies) {
            res.status(200).json({})
            return
        }
        res.status(200).json(movies)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else res.status(400).send('Error with request')
    }
}

type TMovieExport = {
    id: number
    name: string
    rating: number
    year: number | string
    length: number
    subtitles?: number
    nb_comments: number
}
export async function apiGetOneMovie(req: Request, res: Response) {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('empty argument')
        const numID = parseInt(id)
        if (isNaN(numID)) throw new CustomError('incorrect ID format')
        let movie = await prisma.movies.findUnique({
            where: {
                id: numID,
            },
            include: {
                comments: true,
            },
        })
        if (!movie) throw new NotFoundError('no movie found with this ID')

        const movieObj: TMovieExport = {
            id: movie.id,
            name: movie.title,
            rating: movie.rating,
            year: movie.year,
            length: movie.runtime,
            nb_comments: movie.comments.length,
            subtitles: await countNbSub(movie.folder, movie.imdb_code),
        }
        res.status(200).json(movieObj)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else if (error instanceof NotFoundError) res.status(404).send(`Error: ${error.message}`)
        else res.status(400).send('Error with request')
    }
}

async function countNbSub(movie_path: string | null, imdb_code: string): Promise<number> {
    const fs = require('fs')
    const path = require('path')

    if (!movie_path) return 0

    let nbSubtitles: number = 0
    let langage: string = 'en'
    let subFilename = imdb_code + '_' + langage + '.vtt'
    let subPath: string = path.join(movie_path, subFilename)
    if (fs.existsSync(subPath)) nbSubtitles += 1

    langage = 'fr'
    subFilename = imdb_code + '_' + langage + '.vtt'
    subPath = path.join(movie_path, subFilename)
    if (fs.existsSync(subPath)) nbSubtitles += 1

    return nbSubtitles
}

export async function apiDeleteMovie(req: Request, res: Response) {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('empty argument')
        const numID = parseInt(id)
        if (isNaN(numID)) throw new CustomError('incorrect ID format')
        let movie = await prisma.movies.findUnique({
            where: {
                id: numID,
            },
        })
        if (!movie) throw new NotFoundError('no movie found with this ID')

        console.log(movie)

        //deleting related comments
        await prisma.comment.deleteMany({
            where: {
                movieId: numID,
            },
        })
        //deleting related likes
        await prisma.favoriteMovie.deleteMany({
            where: {
                movieId: numID,
            },
        })
        //deleting related viewed movies
        await prisma.viewedMovie.deleteMany({
            where: {
                movieId: numID,
            },
        })
        await prisma.movies.delete({
            where: {
                id: movie.id,
            },
        })

        res.status(200).json(SuccessMsg)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else if (error instanceof NotFoundError) res.status(404).send(`Error: ${error.message}`)
        else res.status(400).send('Error with request')
        console.log(error)
    }
}
