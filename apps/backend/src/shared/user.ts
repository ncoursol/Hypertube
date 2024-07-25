import { MovieDTO } from './movies'

export type TUserContext = {
    id: number
    username: string
    email: string
    firstName: string
    lastName: string
    picture: string
    authMethod: string
    emailConfirmed: boolean
    language: string
}

export type TUserProfile = {
    id: number
    username: string
    firstName: string
    lastName: string
    picture: string
    moviesLiked: MovieDTO[]
    moviesViewed: MovieDTO[]
}

export interface ProfilePrisma {
    id: number
    username: string
    firstName: string | null
    lastName: string | null
    profile_picture: string | null
    viewedMovies: { imdb_code: string }[]
    favoriteMovies: { imdb_code: string }[]
}

export interface ProfileDTO {
    id: number
    username: string
    firstName: string | null
    lastName: string | null
    profilePicture: string | null
    moviesLiked: MovieDTO[]
    moviesViewed: MovieDTO[]
}
