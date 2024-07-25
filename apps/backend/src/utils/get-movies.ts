import { CustomError, Movie, TRequestGetMovie, movieParamSortBy } from '../types_backend/movies'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { Request } from 'express'

type TRequete = {
    limit: number
    page: number
    sort_by: string
    query_term?: string
    genre?: string
    minimum_rating?: number
    order_by?: string
}

const prisma = new PrismaClient()

//`https://yts.mx/api/v2/list_movies.json?limit=${limit}&page=${params.offset}`
export async function getMoviesFromYTS(limit: number, params: TRequestGetMovie): Promise<Movie[]> {
    try {
        const page: number =
            params.offset !== 0 ? Math.floor(params.offset / (limit > 0 ? limit : 1)) + 1 : 1
        const parameters: TRequete = {
            limit: limit * 2,
            page: page,
            sort_by: params.sort,
        }
        if (params.genre.length !== 0) parameters.genre = tabToString(params.genre)
        if (params.grade !== -1) parameters.minimum_rating = params.grade
        if (params.sort === 'seeds') parameters.order_by = 'asc'
        if (params.year !== -1) parameters.query_term = params.year.toString()
        if (params.search !== '') parameters.query_term = params.search

        const response = await axios.get(`https://yts.mx/api/v2/list_movies.json`, {
            params: parameters,
        })

        // console.log(response.config.url)
        // console.log(response.config.params)
        const moviesYTS = response.data.data.movies
        const movies: Movie[] = []

        for (const elem of moviesYTS) {
            const oneMovie: Movie = {
                title: elem.title,
                thumbnail: elem.large_cover_image,
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
            if (params.year === -1 || params.year === oneMovie.year) movies.push(oneMovie)
            if (movies.length === limit) break
        }
        return movies
    } catch (error) {
        return []
    }
}

export function tabToString(tab: string[]): string {
    let str: string = ''
    let i = 0
    for (const elem of tab) {
        if (i === 0) str = elem
        else {
            str = str + ',' + elem
        }
        i = i + 1
    }
    return str
}

type InfoMovie = {
    thumbnail: string
    year: number
    length: number
    imdbRating: number
}

// get movies from EZTV source and update them with movieDB source
export async function getMoviesEZTV(limit: number, params: TRequestGetMovie): Promise<Movie[]> {
    try {
        const page: number =
            params.offset !== 0 ? Math.floor(params.offset / (limit > 0 ? limit : 1)) + 1 : 1
        const response = await axios.get(
            `https://eztv.re/api/get-torrents?limit=${limit * 2}&page=${page}`,
        )
        const moviesEZTV = response.data.torrents
        const movies: Movie[] = []

        for (const elem of moviesEZTV) {
            let info = null
            if (elem.imdb_id && elem.imdb_id !== 0) {
                info = await getInfoMovie(`tt${elem.imdb_id}`)
            }
            let oneMovie: Movie = {
                title: elem.title,
                thumbnail: 'http:' + elem.large_screenshot,
                year: elem.year,
                length: elem.runtime,
                imdbRating: elem.rating,
                imdb_code: `tt${elem.imdb_id}`,
                langage: '',
                genre: [],
                seeds: elem.seeds,
                quality: '',
                url: elem.torrent_url,
                viewed: false,
                liked: false,
                source: 'EZTV',
            }
            if (info) {
                if (info.thumbnail !== '') oneMovie.thumbnail = info.thumbnail
                oneMovie.year = info.year
                oneMovie.imdbRating = info.imdbRating

                movies.push(oneMovie)
                if (movies.length === limit) break
            }
        }
        return movies
    } catch (error) {
        return []
    }
}

//get movies that are stored in our BDD (and where we have a file downloaded)
export async function extractAllMoviesDownloaded(): Promise<Movie[]> {
    try {
        const movies: Movie[] = []
        const moviesBDD = await prisma.movies.findMany({
            where: {
                file: {
                    not: null,
                },
            },
        })
        if (!moviesBDD || moviesBDD.length === 0) return movies

        for (const elem of moviesBDD) {
            const oneMovie: Movie = {
                title: elem.title,
                thumbnail: elem.background_image,
                year: elem.year,
                length: elem.runtime,
                imdbRating: elem.rating,
                imdb_code: elem.imdb_code,
                langage: elem.language,
                genre: elem.genres ? elem.genres?.split(',') : [],
                seeds: 0,
                viewed: false,
                liked: false,
                quality: '',
                url: 'SERVER',
                source: 'SERVER',
            }
            movies.push(oneMovie)
        }
        return movies
    } catch {
        return []
    }
}

// use themoviedb source to extract informations about movies/tv_shows ()
async function getInfoMovie(movie_id: string): Promise<InfoMovie | null> {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/find/${movie_id}?external_source=imdb_id`,
            {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${process.env.MOVIEDB_TOKEN}`,
                },
            },
        )

        const data = response.data
        let image: string = ''

        // if TV_result
        if (data.tv_results.length !== 0) {
            const tv = data.tv_results[0]
            if (tv.poster_path) image = `https://image.tmdb.org/t/p/w500${tv.poster_path}`
            const year: number = parseInt(tv.first_air_date.substr(0, 4))
            return {
                thumbnail: image,
                year: year,
                length: 0,
                imdbRating: tv.vote_average,
            }
        }
        return null
    } catch (error: any) {
        // console.log('cannot get '+movie_id)
        return null
    }
}

export function convertRequestParams(req: Request): TRequestGetMovie {
    const { genre, minGrade, sortBy, limit, offset, downloaded, search, type, year } = req.query
    const limitNB: number = extractInt(true, limit, 'limit')
    const offsetNB: number = extractInt(true, offset, 'offset')
    const yearNB: number = extractInt(false, year, 'year')
    const gradeNB: number = extractInt(false, minGrade, 'minGrade')
    const sortStr: string = extractStr(true, sortBy, 'sortBy', 'seeds')
    const downloadedStr: string = extractStr(false, downloaded, 'downloaded', 'no')
    const searchStr: string = extractStr(false, search, 'search')
    const typeStr: string = extractStr(false, type, 'type', 'movie')
    if (!movieParamSortBy.includes(sortStr)) throw new CustomError(`params sort is incorrect`)
    const genresStr: string = extractStr(false, genre, 'genre')
    const genreTab: string[] = genresStr === '' ? [] : genresStr.split(',')

    // const yearRangeStr: string = extractStr(false, yearRange, 'yearRange')
    // const yearRangeTab: string[] = yearRangeStr === '' ? [] : yearRangeStr.split(',')
    // if (yearRange && yearRangeTab.length !== 2) throw new CustomError(`params yearRangeTab is incorrect`)
    // let yearRangeNb: number[] = []
    // if (yearRange)
    // 	yearRangeNb = [parseInt(yearRangeTab[0]), parseInt(yearRangeTab[1])]

    let params: TRequestGetMovie = {
        genre: genreTab,
        grade: gradeNB,
        sort: sortStr,
        year: yearNB,
        limit: limitNB,
        offset: offsetNB,
        downloaded: downloadedStr,
        search: searchStr,
        type: typeStr,
    }
    return params
}

function extractInt(mandatory: boolean, variable: any, name: string): number {
    if (!mandatory && !variable) return -1
    if (mandatory && !variable && variable !== 0)
        throw new CustomError(`params ${name} is mandatory`)
    const limitNB: number = Array.isArray(variable) ? parseInt(variable[0]) : parseInt(variable)
    return limitNB
}

export function extractStr(mandatory: boolean, variable: any, name: string, def?: string): string {
    if (!mandatory && !variable) return def ? def : ''
    if (mandatory && !variable) throw new CustomError(`params ${name} is mandatory`)
    const str: string = Array.isArray(variable) ? variable[0] : variable
    return str
}
