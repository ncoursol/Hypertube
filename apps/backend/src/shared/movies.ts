export interface MovieDTO {
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
    source: 'EZTV' | 'YTS'
}
