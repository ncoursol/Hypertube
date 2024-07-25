export type Movie = {
    title: string
    thumbnail: string
    year: number
    length: number
    imdbRating?: number
    imdb_code: string
    langage: string
    genre: string[]
    seeds: number
    quality: string
    url: string
    viewed: boolean
    liked: boolean
    source: 'EZTV' | 'YTS' | 'SERVER'
}

export type TRequestGetMovie = {
    genre: string[]
    grade: number
    sort: string
    limit: number
    offset: number
    year: number
    downloaded: string
    search: string
    type: string
}

export class CustomError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export const movieParamSortBy = [
    'title',
    'year',
    'rating',
    'peers',
    'seeds',
    'download_count',
    'like_count',
    'date_added',
]

export type MovieDetails = {
    imdb_code: string
    id_code: string
    title: string
    year: number
    rating: number
    runtime: number
    langage: string
    genres: string[]
    summary: string
    description_full: string
    yt_trailer_code: string
    image: MovieImage
    actors: MovieActor[]
    crews: MovieCrew[]
    budget?: number
    liked: boolean
    recommended: Movie[]
    source: 'YTS' | 'EZTV'
    hash: string
}

export type MovieImage = {
    background?: string
    poster: string
}

export type MovieCrew = {
    department?: string
    job?: string
    name: string
    image?: string
}

export type MovieActor = {
    known_for_department?: string
    name: string
    character: string
    image?: string
}
