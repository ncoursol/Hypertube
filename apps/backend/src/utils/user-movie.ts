import { NotConnected } from '../shared/msg-error'
import { CustomError, Movie, MovieDetails } from '../types_backend/movies'
import { TUserCookie } from '../types_backend/user-cookie'
import { PrismaClient } from '@prisma/client'
import { Request } from 'express'

const prisma = new PrismaClient()

export async function getUserWithFavoritesAndViewed(req: Request) {
    const decoded: TUserCookie = req.user
    const user = await prisma.user.findUnique({
        where: {
            username: decoded.username,
        },
        include: {
            favoriteMovies: { include: { movie: true } },
            viewedMovies: { include: { movie: true } },
        },
    })
    if (!user) throw new CustomError(NotConnected)
    return user
}

export async function addUserDetailsToMovie(user: any, movie: MovieDetails) {
    //verif film deja liked
    const alreadyLike: number = user.favoriteMovies.findIndex(
        (elem: any) => elem.imdb_code === movie.imdb_code,
    )
    // console.log(user)
    // console.log('adding movie ')
    if (alreadyLike !== -1) movie.liked = true
    else movie.liked = false
}

export async function addUserDetailsToMoviesList(user: any, movies: Movie[]) {
    if (!movies || movies.length === 0) return

    let i = 0
    for (i = 0; i < movies.length; i++) {
        const alreadyLiked: number = user.favoriteMovies.findIndex(
            (elem: any) => elem.imdb_code === movies[i].imdb_code,
        )
        if (alreadyLiked !== -1) movies[i].liked = true
        else movies[i].liked = false
        const alreadyViewed: number = user.viewedMovies.findIndex(
            (elem: any) => elem.imdb_code === movies[i].imdb_code,
        )
        if (alreadyViewed !== -1) movies[i].viewed = true
        else movies[i].viewed = false
    }
}
