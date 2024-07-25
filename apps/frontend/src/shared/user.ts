import { MovieDTO } from './movies'

export interface TUserContext {
    id: number
    username: string
    email: string
    firstName: string
    lastName: string
    picture: string
    authMethod: string
    language: string
}

export interface TUserProfile {
    id: number
    username: string
    firstName: string
    lastName: string
    profilePicture: string
    moviesLiked: []
    moviesViewed: []
}

export interface ProfileDTO {
    id: number
    username: string
    firstName: string
    lastName: string
    picture: string
    moviesLiked: MovieDTO[]
    moviesViewed: MovieDTO[]
}
