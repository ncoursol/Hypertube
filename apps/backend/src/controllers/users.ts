import {
    EmailTaken,
    EmptyPhoto,
    InvalidId,
    InvalidPhotoExtension,
    InvalidPhotoId,
    NotConnected,
    PhotoTooBig,
    SuccessMsg,
} from '../shared/msg-error'
import { ProfileDTO, ProfilePrisma } from '../shared/user'
import { TUserCookie } from '../types_backend/user-cookie'
import { formatProfile, formatUser } from '../utils/format'
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { extname } from 'path'

const prisma = new PrismaClient()

export async function getMe(req: Request, res: Response) {
    try {
        const decoded: TUserCookie = req.user
        const user = await prisma.user.findUnique({
            where: {
                username: decoded.username,
            },
        })
        if (!user) {
            res.status(400).send(NotConnected)
            return
        }

        res.status(200).send(formatUser(user))
    } catch (error) {
        res.status(400).send(NotConnected)
    }
}

export async function getListUsers(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
            },
        })
        res.status(200).send(users)
    } catch {
        res.status(400).send('Error fetching users')
    }
}

//specific for RESTful API requirements
export async function getUser(req: Request, res: Response) {
    try {
        const { id } = req.params
        const idUser = parseInt(id)
        if (isNaN(idUser)) {
            res.status(400).send(InvalidId)
            return
        }

        const user = await prisma.user.findUnique({
            where: {
                id: idUser,
            },
        })
        if (!user) {
            res.status(400).send(InvalidId)
            return
        }
        const image = user.profile_picture
            ? `http://localhost:5001/web/users/image/${user.profile_picture}`
            : null
        const userReturned = {
            username: user.username,
            email: user.email,
            profile_picture: image,
        }
        res.status(200).send(userReturned)
    } catch (error) {
        res.status(400).send(InvalidId)
    }
}

//specific for Profile Page
export async function getProfile(req: Request, res: Response) {
    const { id } = req.params

    const profile: ProfilePrisma | null = await prisma.user.findUnique({
        where: {
            id: parseInt(id),
        },
        select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile_picture: true,
            viewedMovies: {
                select: {
                    imdb_code: true,
                },
            },
            favoriteMovies: {
                select: {
                    imdb_code: true,
                },
            },
        },
    })

    if (!profile) {
        res.status(404).send(InvalidId)
        return
    }

    const formattedProfile: ProfileDTO = await formatProfile(profile)
    res.status(200).send(formattedProfile)
}

export function getUserFromRequest(req: Request): TUserCookie {
    try {
        const token = req.cookies.token
        if (token) {
            const decoded = jwt.verify(token, process.env.TOKEN_KEY || '') as JwtPayload
            if (!decoded) throw new Error(NotConnected)
            const decodedCookie: TUserCookie = {
                user_id: decoded.user_id,
                username: decoded.username,
                email: decoded.email,
            }
            return decodedCookie
        } else throw new Error(NotConnected)
    } catch (error) {
        throw new Error(NotConnected)
    }
}

export async function updateSettings(req: Request, res: Response) {
    const { email, firstname, lastname, language } = req.body
    try {
        const userReq: TUserCookie = req.user
        //verif user existe
        const user = await prisma.user.findUnique({
            where: {
                username: userReq.username,
            },
        })
        if (!user) {
            res.status(400).json(NotConnected)
            return
        }

        if (email !== user.email) {
            //verif email not already used
            const verifEmail = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            })
            if (verifEmail) {
                res.status(400).json(EmailTaken)
                return
            }
        }

        //amend user
        const retour = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                email: email,
                firstName: firstname,
                lastName: lastname,
                language: language,
            },
        })
        res.status(200).json(SuccessMsg)
    } catch (error) {
        res.status(400).send('Error with settings')
    }
}

export async function uploadImg(req: Request, res: Response) {
    imageUpload.single('image')(req, res, (err: any) => {
        if (err) {
            return res.status(400).json(err.message)
        }
        uploadImgtoDb(req, res)
    })
}

export async function uploadImgtoDb(req: Request, res: Response) {
    const file: Express.Multer.File | undefined = req.file
    try {
        const userReq: TUserCookie = req.user

        if (!file) {
            res.status(400).json(EmptyPhoto)
            return
        }

        //verif user existe
        const user = await prisma.user.findUnique({
            where: {
                username: userReq.username,
            },
        })
        if (!user) {
            res.status(400).json(NotConnected)
            return
        }

        if (user.profile_picture) {
            //supprimer photo si existe
            const fullfilepath = givePathImage(user.profile_picture)
            deleteFile(res, fullfilepath)
        }

        const retour = await prisma.user.update({
            where: {
                username: userReq.username,
            },
            data: {
                profile_picture: file.filename,
            },
        })
        res.status(200).json(file.filename)
    } catch (error) {
        if (error === NotConnected) res.status(401).json(NotConnected)
    }
}

export async function dowloadImg(req: Request, res: Response) {
    const { filename } = req.params
    const fullfilepath = givePathImage(filename)

    const fs = require('fs')
    fs.stat(fullfilepath, (err: any, stats: any) => {
        if (err) {
            res.status(400).json(InvalidPhotoId)
            return
        }

        res.sendFile(fullfilepath)
    })
}

export function givePathImage(filename: string): string {
    const path = require('path')
    const dirname = path.resolve()
    const fullfilepath = path.join(dirname, 'images/' + filename)
    return fullfilepath
}

export async function deleteImg(req: Request, res: Response) {
    const { filename } = req.params
    const fullfilepath = givePathImage(filename)

    const userReq: TUserCookie = req.user
    const user = await prisma.user.findUnique({
        where: {
            username: userReq.username,
        },
    })
    if (!user) {
        res.status(401).send(NotConnected)
        return
    }

    //verifie si la photo est bien notre photo
    if (user.profile_picture !== filename) {
        res.status(400).json(InvalidPhotoId)
        return
    }

    //update bdd
    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            profile_picture: null,
        },
    })

    //supprimer photo
    deleteFile(res, fullfilepath)
    res.status(200).json(SuccessMsg)
}

function deleteFile(res: Response, fullfilepath: string) {
    const fs = require('fs')
    fs.unlink(fullfilepath, (err: any) => {
        if (err) {
            return false
        }
        return true
    })
}

//handling photo
const multer = require('multer')
export const imageUpload = multer({
    storage: multer.diskStorage({
        destination: function (req: any, file: any, cb: any) {
            cb(null, 'images/')
        },
        filename: function (req: any, file: any, cb: any) {
            const name1 = file.originalname.split('.')[0]
            const name = name1.split(' ').join('_')
            const fileExtName = extname(file.originalname)
            const randomName = Array(8)
                .fill(null)
                .map(() => Math.round(Math.random() * 10).toString(10))
                .join('')
            cb(null, randomName + '_' + name + fileExtName)
        },
    }),
    fileFilter: function (req: any, file: any, cb: any) {
        if (file.size > 1024 * 1024) {
            return cb(new Error(PhotoTooBig))
        }

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
            return cb(new Error(InvalidPhotoExtension))
        }

        cb(null, true)
    },
})
