import { SuccessMsg } from '../shared/msg-error'
import { CustomError, NotFoundError } from '../types_backend/movies'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { Request, Response } from 'express'

const prisma = new PrismaClient()

export async function getUsers(req: Request, res: Response) {
    try {
        let users = await prisma.user.findMany({
            take: 50,
            select: {
                id: true,
                username: true,
            },
        })
        if (!users) {
            res.status(200).json({})
            return
        }
        res.status(200).json(users)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else res.status(400).send('Error with request')
    }
}

export async function getOneUser(req: Request, res: Response) {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('empty argument')
        const numID = parseInt(id)
        if (isNaN(numID)) throw new CustomError('incorrect ID format')
        let user = await prisma.user.findUnique({
            where: {
                id: numID,
            },
            select: {
                username: true,
                email: true,
                profile_picture: true,
            },
        })
        if (!user) throw new NotFoundError('no user found with this ID')

        if (user.profile_picture)
            user.profile_picture = `http://localhost:5001/web/users/image/${user.profile_picture}`
        res.status(200).json(user)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else if (error instanceof NotFoundError) res.status(404).send(`Error: ${error.message}`)
        else res.status(400).send('Error with request')
    }
}

interface UpdateData {
    username?: string
    email?: string
    password?: string
    salt?: string
    profile_picture?: string
}

export async function patchOneUser(req: Request, res: Response) {
    try {
        const { id } = req.params
        const { username, email, password, profile_picture } = req.body
        if (!id) throw new CustomError('empty argument')
        const numID = parseInt(id)
        if (isNaN(numID)) throw new CustomError('incorrect ID format')
        let user = await prisma.user.findUnique({
            where: {
                id: numID,
            },
            select: {
                username: true,
                email: true,
                profile_picture: true,
            },
        })
        if (!user) throw new NotFoundError('no user found with this ID')

        const updateFields: UpdateData = {}

        if (username !== undefined && username.trim() !== '') {
            updateFields.username = username.trim()
        }

        if (email !== undefined && email.trim() !== '') {
            updateFields.email = email.trim()
        }

        if (password !== undefined && password.trim() !== '') {
            const salt = bcrypt.genSaltSync(10)
            updateFields.salt = salt
            updateFields.password = bcrypt.hashSync(password.trim(), salt)
        }

        if (profile_picture !== undefined && profile_picture.trim() !== '') {
            updateFields.profile_picture = profile_picture.trim()
        }

        await prisma.user.update({
            where: {
                id: numID,
            },
            data: updateFields,
        })
        res.status(200).json(SuccessMsg)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else if (error instanceof NotFoundError) res.status(404).send(`Error: ${error.message}`)
        else res.status(400).send('Error with request')
    }
}

export async function apiDeleteUser(req: Request, res: Response) {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('empty argument')
        const numID = parseInt(id)
        if (isNaN(numID)) throw new CustomError('incorrect ID format')
        let user = await prisma.user.findUnique({
            where: {
                id: numID,
            },
        })
        if (!user) throw new NotFoundError('no user found with this ID')

        //deleting related comments
        await prisma.comment.deleteMany({
            where: {
                userId: numID,
            },
        })
        //deleting related likes
        await prisma.favoriteMovie.deleteMany({
            where: {
                userId: numID,
            },
        })
        //deleting related viewed movies
        await prisma.viewedMovie.deleteMany({
            where: {
                userId: numID,
            },
        })
        await prisma.user.delete({
            where: {
                id: user.id,
            },
        })

        res.status(200).json(SuccessMsg)
    } catch (error) {
        if (error instanceof CustomError) res.status(400).send(`Invalid request: ${error.message}`)
        else if (error instanceof NotFoundError) res.status(404).send(`Error: ${error.message}`)
        else res.status(400).send('Error with request')
        console.log(error)
    }
}
