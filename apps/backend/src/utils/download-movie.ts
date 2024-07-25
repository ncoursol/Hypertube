import { CustomError, MovieDetails } from '../types_backend/movies'
import { getMovieByIMDB } from './bdd-movie'
import { open } from './bittorrent/torrent-parser'
import TorrentManager from './bittorrent/torrentManager'
import { File } from './bittorrent/types'
import { getSubtitles } from './subtitles'
import { Movies, PrismaClient } from '@prisma/client'
import axios from 'axios'
import path from 'path'

const prisma = new PrismaClient()

export async function downloadMovie(movieInfo: MovieDetails, source: string) {
    //get movie
    var movie = await getMovieByIMDB(movieInfo.imdb_code)

    if (movie.file) return //movie already downloaded

    let torrent: string = ''
    if (source === 'YTS') {
        //get torrent info
        let torrents = await getTorrentInfo(movieInfo.imdb_code)

        //select torrent:
        torrent = selectTorrent(torrents)
    } else if (movieInfo.hash !== '') torrent = movieInfo.hash

    // //get torrent info
    // let torrents = await getTorrentInfo(imdb_code)

    // //select torrent:
    // let torrent: string = selectTorrent(torrents)

    //download movie
    if (torrent !== '') await downloadTorrent(torrent, movie.id, movieInfo.imdb_code)

    //download subtitles
}

// export async function downloadMovie(movieInfo: MovieDetails, source: string) {
//     //get movie
//     var movie = await getMovieByIMDB(movieInfo.imdb_code)

//     if (movie.status === 'DOWNLOADED') return //movie already downloaded

// 	if (movie.status == 'DOWNLOADING' && downloadStatus.get(movieInfo.imdb_code) !== undefined) {
// 		console.log('movie already downloading')
// 		return //movie already downloading
// 	}

// let torrent: string = ''
// if (source === 'YTS') {
// 	//get torrent info
// 	let torrents = await getTorrentInfo(movieInfo.imdb_code)

// 	//select torrent:
// 	torrent = selectTorrent(torrents)
// }
// else if (movieInfo.hash !== '')
// 	torrent = movieInfo.hash

// 	if (torrent !== '') {
// 		//download movie
// 		await downloadTorrent(torrent, movie.id, movieInfo.imdb_code)
// 	}

// }

async function downloadSubtitle(imdb_code: string) {
    try {
        var movie = await getMovieByIMDB(imdb_code)
        console.log('start looking for subtitles, path=' + movie.folder)
        // console.log(movie)

        if (movie && movie.folder) await getSubtitles(movie.title, imdb_code, movie.folder)
        console.log('end looking for subtitles')
    } catch (error) {
        // if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        // else res.status(400).send('Sub not found')
    }
}

async function getTorrentInfo(imdb_code: string) {
    try {
        const response = await axios.get(`https://yts.mx/api/v2/movie_details.json`, {
            params: {
                imdb_id: imdb_code,
            },
        })
        if (response.data.status !== 'ok') throw new CustomError('Code not found 1')
        if (response.data.data.movie.imdb_code !== imdb_code)
            throw new CustomError('Code not found 2')

        const movie = response.data.data.movie
        const torrents = movie.torrents

        if (torrents.length === 0) throw new CustomError('No torrents available')

        return torrents
    } catch (error) {
        if (error instanceof CustomError) throw new CustomError(error.message)
        else throw new CustomError('API error')
    }
}

function selectTorrent(torrents: any) {
    let url: string = ''
    let seeds = 0

    for (const elem of torrents) {
        if (elem.seeds > seeds) {
            seeds = elem.seeds
            url = elem.hash
        }
    }
    return url
}

export async function downloadTorrent(hash: string, movieID: number, imdb_code: string) {
    var torrentStream = require('torrent-stream')

    console.log('hash selected=' + hash)

    var engine = torrentStream(`magnet:?xt=urn:btih:${hash}`, {
        path: `${process.env.FOLDER_SAVE}`,
        trackers: [
            'udp://open.demonii.com:1337/announce',
            'udp://tracker.openbittorrent.com:80',
            'udp://tracker.coppersurfer.tk:6969',
            'udp://glotorrents.pw:6969/announce',
            'udp://tracker.opentrackr.org:1337/announce',
            'udp://torrent.gresille.org:80/announce',
            'udp://p4p.arenabg.com:1337',
            'udp://tracker.leechers-paradise.org:6969',
        ],
    })

    engine.on('ready', function () {
        engine.files.forEach(async function (file: any) {
            console.log('filename:', file.name)
            console.log('full path:', `${engine.path} =/= ${file.path}`)
            let filePath: string = ''
            if (file.name !== file.path) filePath = file.path.replace(`/${file.name}`, '')
            const folderPath: string = `${engine.path}/${filePath}`
            var stream = file.createReadStream()
            if (
                file &&
                (file.name.endsWith('.mp4') ||
                    file.name.endsWith('.mkv') ||
                    file.name.endsWith('.webm'))
            ) {
                //sauvegarder nom bdd
                try {
                    console.log('saving info for movie:')
                    console.log(`file.name=${file.name}`)
                    console.log(`file.path=${file.path}`)
                    console.log(`DB file=${file}`)
                    console.log(`DB folder=${folderPath}`)
                    await prisma.movies.update({
                        where: {
                            id: movieID,
                        },
                        data: {
                            file: `${file.name}`,
                            folder: folderPath,
                            dateDownload: new Date(),
                        },
                    })
                } catch (error) {
                    console.log('error on DB movie ')
                    console.log(error)
                }

                //look for subtitles
                await downloadSubtitle(imdb_code)
            }

            // stream is readable stream to containing the file content
        })
    })

    engine.on('idle', function () {
        engine.files.forEach(function (file: any) {
            console.log('finished filename:', file.name)
            if (file.name.endsWith('.srt')) {
            }
        })
    })
}

// export const downloadStatus = new Map<string, TorrentManager>()

// let isStarting = false

// export async function downloadTorrent(url: string, movieID: number, imdb_code: string) {
//     if (isStarting) return
//     isStarting = true
//     var torrentStream = require('torrent-stream')

//     console.log('url selected=' + url)

//     if (downloadStatus.get(imdb_code) !== undefined) {
//         console.log('movie already downloading 2')
//         return //movie already downloading
//     }
//     const torrent = await open(url)
//     console.log(torrent)
//     const torrentManager = new TorrentManager(torrent)
//     downloadStatus.set(imdb_code, torrentManager)
//     isStarting = false

//     torrentManager.on('ready', async (fileList: File[]) => {
//         for (const file of fileList) {
//             console.log(file)
//             const filePath: string = path.basename(file.path)
//             const folderPath: string = path.dirname(file.path)
//             // TODO: handle different format webm / webp / mp4 / mkv ?
//             if (file.path.endsWith('.mp4') || file.path.endsWith('.mkv') || file.path.endsWith('.webm')) {
//                 //sauvegarder nom bdd
//                 await prisma.movies.update({
//                     where: {
//                         id: movieID,
//                     },
//                     data: {
//                         file: filePath,
//                         folder: folderPath,
//                         dateDownload: new Date(),
//                         status: 'DOWNLOADING',
//                     },
//                 })

//                 //look for subtitles
//                 await downloadSubtitle(imdb_code)
//             }
//         }
//     })

//     torrentManager.on('done', (success: boolean) => {
//         prisma.movies.update({
//             where: {
//                 id: movieID,
//             },
//             data: {
//                 status: success ? 'DOWNLOADED' : 'NOTDOWNLOADED',
//             },
//         })
//     })

//     torrentManager.start()
// }
