import { CustomError, Movie, MovieDetails } from '../types_backend/movies'
import { createMovieDB, getMovieByIMDB, movieViewed } from '../utils/bdd-movie'
import TorrentManager from '../utils/bittorrent/torrentManager'
import { downloadMovie } from '../utils/download-movie'
// import { downloadStatus } from '../utils/download-movie'
import {
    convertRequestParams,
    extractAllMoviesDownloaded,
    extractStr,
    getMoviesEZTV,
    getMoviesFromYTS,
} from '../utils/get-movies'
import {
    addDetailsFromMovieDB,
    addRecommandatedMovies,
    getInfoMovieTorrent,
    getInfoMovieTorrentEZTV,
    getMovieId,
} from '../utils/info-movie'
import { extractLangageSub, getSubtitles } from '../utils/subtitles'
import {
    addUserDetailsToMovie,
    addUserDetailsToMoviesList,
    getUserWithFavoritesAndViewed,
} from '../utils/user-movie'
import { PrismaClient, User } from '@prisma/client'
import { HttpStatusCode } from 'axios'
import { Request, Response } from 'express'

const prisma = new PrismaClient()

export async function getMovies(req: Request, res: Response) {
    try {
        const params = convertRequestParams(req)
        console.log(params)

        const user: User = await getUserWithFavoritesAndViewed(req)

        let movies: Movie[] = []

        // const repartition: number = Math.floor((params.limit / 4) * 3)
        if (params.downloaded === 'no') {
            if (params.type === 'movie') {
                const moviesYTS: Movie[] = await getMoviesFromYTS(params.limit, params)
                if (moviesYTS && moviesYTS.length !== 0) movies = movies.concat(moviesYTS)
            } else if (params.type === 'tvShow') {
                const moviesEZTV: Movie[] = await getMoviesEZTV(params.limit, params)
                if (moviesEZTV && moviesEZTV.length !== 0) movies = movies.concat(moviesEZTV)
            }
        } else {
            const moviesYTS: Movie[] = await extractAllMoviesDownloaded()
            if (moviesYTS && moviesYTS.length !== 0) movies = movies.concat(moviesYTS)
        }

        await addUserDetailsToMoviesList(user, movies)

        res.status(201).send(movies)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else res.status(400).send('Error')
        console.log(error)
    }
}

export async function getMovieInfo(req: Request, res: Response) {
    try {
        const { source } = req.query
        const movieId = getMovieId(req)
        const sourceArg: string = extractStr(false, source, 'source', 'YTS')

        const user: User = await getUserWithFavoritesAndViewed(req)

        console.log('here we are: source=' + sourceArg)
        const movie = await (sourceArg === 'EZTV'
            ? getInfoMovieTorrentEZTV(movieId)
            : getInfoMovieTorrent(movieId))

        if (movie === null) {
            throw new CustomError('Movie not found')
        }

        //get info from TheMovieDB
        await addDetailsFromMovieDB(movie)

        //add info from user (already viewed / already liked)
        await addUserDetailsToMovie(user, movie)

        // ajout recommandation films
        await addRecommandatedMovies(movie)

        // verif si film existe deja dans BDD. Si non, ajout dans BDD
        await createMovieDB(movie)

        //add movie to viewed By user
        await movieViewed(user, movieId)

        //downloading movie
        await downloadMovie(movie, sourceArg)

        // console.log(movie)
        res.status(201).send(movie)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else res.status(400).send('Error')
    }
}

export async function likeMovie(req: Request, res: Response) {
    try {
        //recupere user
        const user = await getUserWithFavoritesAndViewed(req)

        //verifie film existe
        const movieId = getMovieId(req)
        const movie = await prisma.movies.findMany({
            where: {
                imdb_code: movieId,
            },
        })
        if (!movie || movie.length !== 1) throw new CustomError('Wrong imdb code')

        //verif film deja liked
        const alreadyLike: number = user.favoriteMovies.findIndex(
            (elem) => elem.movieId === movie[0].id,
        )

        if (alreadyLike === -1) {
            await prisma.favoriteMovie.create({
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
            res.status(200).send('Movie liked')
        } else {
            await prisma.favoriteMovie.delete({
                where: {
                    id: user.favoriteMovies[alreadyLike].id,
                },
            })
            res.status(200).send('Movie unliked')
        }
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else res.status(400).send('Movie cannot be liked')
        console.log(error)
    }
}

//get info from OpenSub
// const ffmpeg = require('fluent-ffmpeg');

export async function viewMovie(req: Request, res: Response) {
    const path = require('path')
    const fs = require('fs')

    try {
        const movieId = getMovieId(req)
        console.log(movieId)

        var movie = await getMovieByIMDB(movieId)

        var videoPath = '' //path.join('movies', movie.file)

        // if (!movie.file) {
        // console.log('downloading movie')
        // await downloadMovie(movie)
        // console.log('movie downloaded ?')
        // var movie = await getMovieByIMDB(movieId)
        // console.log('update movie ' + movie.file)
        // }
        // else
        // videoPath = movie.file

        if (!movie.file || !movie.folder) throw new Error('Movie not found')

        videoPath = path.join(movie.folder, movie.file)

        console.log('watching movie = ' + videoPath)

        if (!fs.existsSync(videoPath)) throw new Error('Movie not found')

        const stat = fs.statSync(videoPath)
        const fileSize = stat.size

        const range = req.headers.range

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

            const chuncksize = end - start + 1
            const file = fs.createReadStream(videoPath, { start, end })
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': `bytes`,
                'Content-Length': chuncksize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(206, head) //partial response
            file.pipe(res)
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            const videoStream = fs.createReadStream(videoPath)
            videoStream.pipe(res)
        }
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else res.status(404).send('Movie not found')
        console.log(error)
    }
}

// export async function viewMovie(req: Request, res: Response) {
//     const path = require('path')
//     const fs = require('fs')

//     try {
//         const movieId = getMovieId(req)

//         var movie = await getMovieByIMDB(movieId)

//         var videoPath = '' //path.join('movies', movie.file)

//         // if (!movie.file) {
//         // console.log('downloading movie')
//         // await downloadMovie(movie)
//         // console.log('movie downloaded ?')
//         // var movie = await getMovieByIMDB(movieId)
//         // console.log('update movie ' + movie.file)
//         // }
//         // else
//         // videoPath = movie.file

//         if (!movie.file || !movie.folder) throw new Error('Movie not found')

//         videoPath = path.join(movie.folder, movie.file)

//         // console.log('watching movie = ' + videoPath)

//         if (!fs.existsSync(videoPath)) throw new Error('Movie not found')

//         const stat = fs.statSync(videoPath)
//         let fileSize = stat.size

//         if (fileSize <= 0) {
//             const downloadManager = downloadStatus.get(movie.imdb_code)
//             if (!downloadManager) {
//                 console.log('download manager not found')
//             } else {
//                 console.log(
//                     'available bytes: ',
//                     JSON.stringify(downloadManager.getMovieBytesStatus()),
//                 )
//             }
//             res.status(400).send('File not yet created.')
//             return
//         }

//         console.log('file size: ', fileSize)

//         const range = req.headers.range

//         if (!range) {
//             res.status(400).send('Requires Range header')
//             return
//         }

//         const parts = range.replace(/bytes=/, '').split('-')
//         const start = parseInt(parts[0], 10)
//         const CHUNK_SIZE = 10 ** 6 // 1MB
//         let end = Math.min(start + CHUNK_SIZE, fileSize - 1)

//         if (movie.status === 'DOWNLOADING') {
//             const downloadManager = downloadStatus.get(movie.imdb_code)

//             if (!downloadManager) {
//                 // TODO: Delete completely with function in cron fron Nico
//                 const folderExists = await fs
//                     .access(movie.folder)
//                     .then(() => true)
//                     .catch(() => false)

//                 if (folderExists) {
//                     await fs.rm(movie.folder, { recursive: true })
//                 }
//                 await prisma.movies.update({
//                     where: {
//                         id: movie.id,
//                     },
//                     data: {
//                         status: 'NOTDOWNLOADED',
//                         folder: null,
//                         file: null,
//                     },
//                 })

//                 res.status(400).send('Downloading failed. You can reload and try again')
//                 return
//             }

//             fileSize = downloadManager.getVideoLength()
//             end = Math.min(start + CHUNK_SIZE, fileSize - 1)
//             console.log('Availabale bytes: ', JSON.stringify(downloadManager.getMovieBytesStatus()))
//             let available = downloadManager
//                 .getMovieBytesStatus()
//                 .some((range) => range[0] <= start && range[1] >= end)
//             if (!available) {
//                 console.log('waiting for available bytes: ' + start + ' - ' + end)
//                 const startTime = Date.now()
//                 available = await waitForAvailable(start, end, downloadManager, startTime, 20000)
//                 if (!available) {
//                     res.status(400).send('Data not yet available. Try again later.')
//                     return
//                 }
//             }
//         }

//         const length = end - start + 1
//         const file = fs.createReadStream(videoPath, { start, end })
//         console.log('sending bytes: ' + start + ' - ' + end)
//         const head = {
//             'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//             'Accept-Ranges': `bytes`,
//             'Content-Length': length,
//             'Content-Type': `video/${movie.file.split('.').pop()}`,
//         }
//         res.writeHead(206, head) //partial response
//         file.pipe(res)
//     } catch (error) {
//         if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
//         else res.status(404).send('Movie not found')
//         console.log(error)
//     }
// }

async function waitForAvailable(
    start: number,
    end: number,
    downloadManager: TorrentManager,
    startTime: number,
    timeout: number,
): Promise<boolean> {
    while (Date.now() - startTime < timeout) {
        let available = downloadManager
            .getMovieBytesStatus()
            .some((range) => range[0] <= start && range[1] >= end)
        if (available) {
            return true
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(waitForAvailable(start, end, downloadManager, startTime, timeout))
            }, 3000)
        })
    }
    return false
}

// ffmpeg()
// .input(videoName)
// .videoCodec('libx264')
// .audioCodec('libmp3lame')
// .format('mpegts')
// .on('end', function () {
// 	console.log('streaming video done')
// })
// .pipe(res, { end: true });

// res.status(200).send('Movie')

// const videoPath = path.join(__dirname, 'movies', videoName);

// Envoyer la vidéo au client
// res.sendFile(fullfilepath);
// res.status(200).send('Movie viewed')

export async function getSubtitle(req: Request, res: Response) {
    const fs = require('fs')
    const path = require('path')

    try {
        const movieId = getMovieId(req)
        const langage = extractLangageSub(req)

        const movie = await getMovieByIMDB(movieId)
        const movie_path = movie.folder

        const subFilename = movieId + '_' + langage + '.vtt'
        console.log('trying to get subtitle ' + movie_path + ', name=' + subFilename)
        const subPath: string = path.join(movie_path, subFilename)
        console.log('we have file:' + subPath)

        // Get the root directory of the project
        const rootDir = path.join(__dirname, '..')

        if (fs.existsSync(subPath)) {
            res.status(200).sendFile(subPath, (err) => {
                //process.cwd() + `${movie_path}/${subFilename}`
                if (err) {
                    console.error("Erreur lors de l'envoi du fichier :", err)
                    res.status(HttpStatusCode.NotFound).send('Subtitle not found')
                }
            })
        } else {
            res.status(404).send('Sub not found')
        }
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else res.status(404).send('Sub not found')
        console.log(error)
    }
}

export async function convertSrtSubtitle(srtFile: string, folder: string): Promise<string> {
    var srt2vtt = require('srt-to-vtt')
    const path = require('path')
    const fs = require('fs')

    const vttFile: string = srtFile.replace('.srt', '.vtt')

    const subPath: string = path.join(folder, srtFile)
    const vttPath: string = path.join(folder, vttFile)

    fs.createReadStream(subPath).pipe(srt2vtt()).pipe(fs.createWriteStream(vttPath))
    return vttFile
}

export async function testDownload(req: Request, res: Response) {
    var torrentStream = require('torrent-stream')

    var hash = '4ADC19F35034A29A4A284FB7EF971F9684349ECD'

    var engine = torrentStream(`magnet:?xt=urn:btih:${hash}`, {
        path: `/tmp/nicoDL`,
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
        engine.files.forEach(function (file: any) {
            console.log('filename:', file.name)
            console.log('engine path:', `${engine.path}`)
            console.log('file path:', `${file.path}`)
            console.log('full path:', `${engine.path}/${file.path}`)
            var stream = file.createReadStream()
            // stream is readable stream to containing the file content
        })
    })

    engine.on('idle', function () {
        engine.files.forEach(function (file: any) {
            console.log('finished filename:', file.name)
            // stream is readable stream to containing the file content
        })
    })

    res.status(200).send('Movie downloaded')
}

export async function testSub(req: Request, res: Response) {
    try {
        const movieId = getMovieId(req)

        var movie = await getMovieByIMDB(movieId)

        if (movie && movie.folder) await getSubtitles(movie.title, movieId, movie.folder)
        res.status(200).send('subtitles ok')
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else res.status(400).send('Sub not found')
    }
}
