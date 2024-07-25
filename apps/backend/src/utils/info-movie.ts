import {
    CustomError,
    Movie,
    MovieActor,
    MovieCrew,
    MovieDetails,
    MovieImage,
} from '../types_backend/movies'
import { extractStr } from './get-movies'
import axios from 'axios'
import { Request } from 'express'

export function getMovieId(req: Request): string {
    const { movieId } = req.params
    const idStr: string = extractStr(true, movieId, 'movieId')
    if (!idStr.match('tt')) throw new CustomError('Invalid movie id')
    return idStr
}

//for YTS source
export async function getInfoMovieTorrent(movieId: string): Promise<MovieDetails | null> {
    try {
        const response = await axios.get(`https://yts.mx/api/v2/movie_details.json`, {
            params: {
                imdb_id: movieId,
            },
        })
        if (response.data.status !== 'ok') throw new CustomError('Code not found')
        if (response.data.data.movie.imdb_code !== movieId) throw new CustomError('Code not found')

        const movie = response.data.data.movie

        const images: MovieImage = {
            background: movie.background_image,
            poster: movie.large_cover_image,
        }
        const retour: MovieDetails = {
            imdb_code: movieId,
            id_code: movie.id,
            title: movie.title,
            year: movie.year,
            rating: movie.rating,
            runtime: movie.runtime,
            langage: movie.language,
            genres: movie.genres,
            summary: movie.summary,
            description_full: movie.description_full,
            yt_trailer_code: movie.yt_trailer_code,
            image: images,
            actors: [],
            crews: [],
            liked: false,
            recommended: [],
            source: 'YTS',
            hash: '',
        }
        return retour
    } catch {
        return null
    }
}

export async function getInfoMovieTorrentEZTV(movieId: string): Promise<MovieDetails> {
    try {
        const response = await axios.get(`https://eztvx.to/api/get-torrents`, {
            params: {
                imdb_id: movieId.replace('tt', ''),
            },
        })
        if (response.data.torrents.length === 0) throw new CustomError('Error with EZTV API')

        const movie = response.data.torrents[0]

        const images: MovieImage = {
            poster: '',
        }
        const retour: MovieDetails = {
            imdb_code: movieId,
            id_code: movie.id,
            title: movie.title,
            year: 0,
            rating: 0,
            runtime: 0,
            langage: '',
            genres: [],
            summary: '',
            description_full: '',
            yt_trailer_code: '',
            image: images,
            actors: [],
            crews: [],
            liked: false,
            recommended: [],
            source: 'EZTV',
            hash: movie.hash,
        }
        return retour
    } catch (error) {
        throw new CustomError('Code not found')
    }
}

export async function addDetailsFromMovieDB(movie: MovieDetails) {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.imdb_code}?append_to_response=credits%2Ctrailers&language=en-US`,
            {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${process.env.MOVIEDB_TOKEN}`,
                },
            },
        )
        const data = response.data
        if (data.budget) movie.budget = data.budget
        if (data.overview) movie.summary = data.overview
        if (!movie.rating || movie.rating === 0) movie.rating = data.popularity
        if (!movie.runtime || movie.runtime === 0) movie.runtime = data.runtime
        if (!movie.image.poster && data.poster_path) movie.image.poster = data.poster_path
        if (!movie.image.background && data.backdrop_path)
            movie.image.background = data.backdrop_path
        if (data.credits.cast) {
            const actors: MovieActor[] = giveListActors(data.credits.cast)
            movie.actors = actors
        }
        if (data.credits.crew) {
            const crew: MovieCrew[] = giveListCrews(data.credits.crew)
            movie.crews = crew.filter(
                (elem) =>
                    elem.job && ['Director', 'Writer', 'Story', 'Producer'].includes(elem.job),
            )
        }
        return
    } catch {
        return
    }
}

function giveListActors(raw: any): MovieActor[] {
    const actors: MovieActor[] = []
    if (!Array.isArray(raw)) return actors
    if (raw.length === 0) return actors
    for (const elem of raw) {
        const newActor: MovieActor = {
            known_for_department: elem.known_for_department,
            name: elem.name,
            character: elem.character,
            image: imageFromMovieDB(elem.profile_path),
        }
        actors.push(newActor)
    }
    return actors
}

function giveListCrews(raw: any): MovieCrew[] {
    const crew: MovieCrew[] = []
    if (!Array.isArray(raw)) return crew
    if (raw.length === 0) return crew
    for (const elem of raw) {
        const newCrew: MovieCrew = {
            department: elem.department,
            name: elem.name,
            job: elem.job,
            image: imageFromMovieDB(elem.profile_path),
        }
        crew.push(newCrew)
    }
    return crew
}

function imageFromMovieDB(path: string): string | undefined {
    if (path && path !== '') {
        return `https://image.tmdb.org/t/p/w500${path}`
    }
    return undefined
}

export async function addRecommandatedMovies(movie: MovieDetails) {
    if (movie.source !== 'YTS') return
    const response = await axios.get(`https://yts.mx/api/v2/movie_suggestions.json`, {
        params: {
            movie_id: movie.id_code,
        },
    })
    if (response.data.status !== 'ok') return
    const moviesRecoY = response.data.data.movies
    const movies: Movie[] = []

    if (moviesRecoY.length > 0)
        for (const elem of moviesRecoY) {
            const oneMovie: Movie = {
                title: elem.title,
                thumbnail: elem.medium_cover_image,
                year: elem.year,
                length: elem.runtime,
                imdbRating: elem.rating,
                imdb_code: elem.imdb_code,
                langage: elem.language,
                genre: elem.genres,
                seeds: elem.torrents[0].seeds,
                quality: elem.torrents[0].quality,
                url: elem.torrents[0].url,
                viewed: false,
                liked: false,
                source: 'YTS',
            }
            movies.push(oneMovie)
        }
    if (movies.length > 0) movie.recommended = movies
}
