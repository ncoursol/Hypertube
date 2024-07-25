import { CustomError, Movie, MovieDetails } from '../types_backend/movies'
import { tabToString } from './get-movies'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createMovieDB(movie: MovieDetails) {
    try {
        const movies = await prisma.movies.findMany({
            where: {
                imdb_code: movie.imdb_code,
            },
        })
        if (movies && movies.length !== 0) {
            return false
        }
        //creation film dans BDD
        const newMovie = await prisma.movies.create({
            data: {
                imdb_code: movie.imdb_code,
                title: movie.title,
                year: movie.year,
                rating: movie.rating,
                runtime: movie.runtime,
                genres: tabToString(movie.genres),
                summary: movie.summary,
                language: movie.langage,
                background_image: movie.image.poster,
            },
        })
        return true
    } catch {
        return false
    }
}

export async function movieViewed(user: any, movieId: string) {
    try {
        //recuperer film
        const movie = await prisma.movies.findMany({
            where: {
                imdb_code: movieId,
            },
        })
        if (!movie || movie.length !== 1) throw new CustomError('Error creating movie on database')

        //verif film deja vu
        const alreadyViewed: number = user.viewedMovies.findIndex(
            (elem: any) => elem.movieId === movie[0].id,
        )

        if (alreadyViewed === -1) {
            await prisma.viewedMovie.create({
                data: {
                    user: {
                        connect: { id: user.id },
                    },
                    movie: {
                        connect: { id: movie[0].id },
                    },
                    imdb_code: movie[0].imdb_code,
                },
            })
        }
    } catch (error) {
        if (error instanceof CustomError) throw new CustomError(error.message)
        else throw new CustomError('Unknown error..')
    }
}

export async function getMovieByIMDB(movieId: string) {
    try {
        const movie = await prisma.movies.findMany({
            where: {
                imdb_code: movieId,
            },
        })
        if (!movie || movie.length !== 1) throw new CustomError('Movie not found on database')
        return movie[0]
    } catch (error) {
        if (error instanceof CustomError) throw new CustomError(error.message)
        else throw new CustomError('Unknown error..')
    }
}
