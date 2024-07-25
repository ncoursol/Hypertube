import { PrismaClient } from '@prisma/client'

const path = require('path')
const fs = require('fs').promises
const prisma = new PrismaClient()

export const removeMovieFolder = async (folder: string | null) => {
    const folderPath = path.join(folder)

    try {
        const folderExists = await fs
            .access(folderPath)
            .then(() => true)
            .catch(() => false)

        if (folderExists) {
            await fs.rm(folderPath, { recursive: true })
            console.log(`Removed folder for movie: ${folder}`)
        }
    } catch (error) {
        console.error(`Error removing folder for movie ${folder}:`, error)
    }
}

export const scheduleTask = async () => {
    try {
        const moviesToDelete = await prisma.movies.findMany({
            where: {
                dateDownload: {
                    lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                    //lt: new Date(Date.now()), // every movies
                },
            },
        })

        for (const movie of moviesToDelete) {
            await removeMovieFolder(movie.folder)
            await prisma.movies.update({
                where: { id: movie.id },
                data: { file: null, dateDownload: null, folder: null },
            })
            console.log(`Removed file, dateDownload and folder movie with ID ${movie.imdb_code}`)
        }
    } catch (error) {
        console.error('Error executing cron job:', error)
    }
}
