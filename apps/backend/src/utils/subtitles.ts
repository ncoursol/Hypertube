import { convertSrtSubtitle } from '../controllers/movies'
import { CustomError } from '../types_backend/movies'
import { extractStr } from './get-movies'
import { Request } from 'express'

const subscene = require('node-subscene-api')

export function extractLangageSub(req: Request): string {
    const { lang } = req.query
    const langage: string = extractStr(false, lang, 'langage', 'en')
    return langage
}

export async function getSubtitles(title: string, imdb_code: string, folder: string) {
    var moviePath: string = ''

    console.log('start function sub')

    if (!folder) throw new CustomError('No folder for subtitles')

    //get path to movie
    await subscene
        .search(title)
        .then((results: any) => {
            if (results && results.length > 0) moviePath = results[0].path
            else throw new CustomError(`No subtitle found for ${title} (code ${imdb_code})`)
        })
        .catch((err: any) => {
            if (err instanceof CustomError) throw new CustomError(err.message)
            throw new CustomError('Error with research on node-subscene-api')
        })

    var frenchSubPath: string = ''
    var englishSubPath: string = ''

    //use path to get path for french and english subs
    await subscene
        .getSubtitles(moviePath, false)
        .then((subtitles: any) => {
            if (subtitles && subtitles.french) {
                console.log(`${subtitles.french.length} subtitles for french`)
                if (subtitles.french.length > 0) frenchSubPath = subtitles.french[0].path
                for (const elem of subtitles.french) {
                    if (elem.title.match('YIFY')) {
                        frenchSubPath = elem.path
                        break
                    }
                }
            }

            if (subtitles && subtitles.english) {
                console.log(`${subtitles.english.length} subtitles for english`)
                if (subtitles.english.length > 0) englishSubPath = subtitles.english[0].path
                for (const elem of subtitles.english) {
                    if (elem.title.match('YIFY')) {
                        englishSubPath = elem.path
                        break
                    }
                }
            }
        })
        .catch((err: any) => {
            throw new CustomError('Error with getSubtitles on node-subscene-api')
        })

    //download en+fr files and convert them
    try {
        await downloadOneSub(frenchSubPath, 'fr', imdb_code, folder)
        await convertSrtSubtitle(`${imdb_code}_fr.srt`, folder)
    } catch {}
    try {
        await downloadOneSub(englishSubPath, 'en', imdb_code, folder)
        await convertSrtSubtitle(`${imdb_code}_en.srt`, folder)
    } catch {}
}

async function downloadOneSub(pathAPI: string, lang: string, imdb_code: string, folder: string) {
    const fs = require('fs')
    const path = require('path')

    if (pathAPI !== '') {
        await subscene
            .download(pathAPI)
            .then((file: any) => {
                // console.log('file ' + pathAPI)
                // console.log(file)

                const fileContent = file[0].file.toString()

                const frenchName: string = `${imdb_code}_${lang}.srt`
                const frenchPath: string = path.join(folder, frenchName)

                fs.writeFile(frenchPath, fileContent, (err: any) => {
                    if (err) {
                        console.error("Erreur lors de l'enregistrement du fichier:", err)
                    } else {
                        // console.log('Fichier enregistré avec succès!');
                    }
                })
            })
            .catch((err: any) => {
                throw new CustomError('Error downloading subtitle using node-subscene-api')
            })
    } else throw new CustomError(`No subtitle for ${lang} on imdb ${imdb_code}`)
}
