import {
    get42Token,
    get42User,
    getFacebookToken,
    getFacebookUser,
    getGithubToken,
    getGithubUser,
} from '../utils/axios'
import { formatUser, generateUniqueUsername } from '../utils/format'
import { generateId } from '../utils/generate-code'
import { generateEmailBodyForgotPwd, generateEmailBodyNewUser } from '../utils/generateBodyEmail'
import { signJwt } from '../utils/jwt'
import { sendEmail } from '../utils/mail'
import { PrismaClient, User } from '@prisma/client'
import bcrypt from 'bcrypt'
import { Request, Response } from 'express'

const prisma = new PrismaClient()

export async function register(req: Request, res: Response) {
    const { username, email, password, firstName, lastName } = req.body

    // Check if a user with email OR with username already exists
    let user = await prisma.user.findMany({
        where: {
            email: email,
        },
    })

    if (user.length > 0) {
        res.status(400).send('userEmailExists')
        return
    }

    user = await prisma.user.findMany({
        where: {
            username: username,
        },
    })

    if (user.length > 0) {
        res.status(400).send('userUsernameExists')
        return
    }

    const salt = bcrypt.genSaltSync(10)
    const confirmID: string = generateId()
    await prisma.user.create({
        data: {
            username: username,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: bcrypt.hashSync(password, salt),
            salt: salt,
            email_confirm_id: confirmID,
        },
    })

    const emailBody: string = generateEmailBodyNewUser(username, confirmID)
    sendEmail('Verify your account', email, emailBody)

    res.status(201).send('userCreated')
}

export async function login(req: Request, res: Response) {
    const { username, password } = req.body

    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
    })

    if (!user) {
        res.status(400).send('invalidCredentials')
        return
    }

    if (user.authMethod !== 'EMAIL') {
        res.status(400).send('wrongAuthMethod' + user.authMethod)
        return
    }

    if (!user.email_verified) {
        res.status(200).send('emailNotVerified')
        return
    }

    // Check if password is correct
    const PHash = bcrypt.hashSync(password, user.salt || '') // user.salt is not null if authMethos is email, but typescript doesn't know that
    if (PHash === user.password) {
        const token = signJwt(user)
        res.cookie('token', token, { sameSite: 'none', secure: true })
        res.status(200).send(formatUser(user))
        return
    } else {
        res.status(400).send('invalidCredentials')
        return
    }
}

export async function login42(req: Request, res: Response) {
    const { code } = req.body
    let access_token: string
    try {
        access_token = await get42Token(code)
    } catch (err) {
        console.log(err)
        return
    }
    const { login, email, first_name, last_name } = await get42User(access_token)

    // Find user in db
    let user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    })

    // Check if user already exists and if its authMethod is 42
    if (!user) {
        const username = await generateUniqueUsername(login)

        user = await prisma.user.create({
            data: {
                username: username,
                firstName: first_name,
                lastName: last_name,
                email: email,
                authMethod: 'FORTYTWO',
                email_verified: true,
            },
        })
    } else if (user.authMethod !== 'FORTYTWO') {
        res.status(400).send('wrongAuthMethod' + user.authMethod)
        return
    }

    const token = signJwt(user)
    res.cookie('token', token, { sameSite: 'none', secure: true })
    res.status(200).send(formatUser(user))
    return
}

export async function loginGithub(req: Request, res: Response) {
    const { code } = req.body
    let access_token: string
    try {
        access_token = await getGithubToken(code)
    } catch (err) {
        console.log(err)
        return
    }
    const { login, email, avatar_url } = await getGithubUser(access_token)

    // Find user in db
    let user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    })

    // Check if user already exists and if its authMethod is 42
    if (!user) {
        const username = await generateUniqueUsername(login)

        user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                authMethod: 'GITHUB',
                email_verified: true,
                profile_picture: avatar_url,
            },
        })
    } else if (user.authMethod !== 'GITHUB') {
        res.status(400).send('wrongAuthMethod' + user.authMethod)
        return
    }

    const token = signJwt(user)
    res.cookie('token', token, { sameSite: 'none', secure: true })
    res.status(200).send(formatUser(user))
    return
}

export async function loginFacebook(req: Request, res: Response) {
    const { code } = req.body
    let access_token: string
    try {
        access_token = await getFacebookToken(code)
    } catch (err) {
        console.log(err)
        return
    }
    const { name, email } = await getFacebookUser(access_token)

    // Find user in db
    let user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    })

    // Check if user already exists and if its authMethod is 42
    if (!user) {
        const username = await generateUniqueUsername(name)

        user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                authMethod: 'FACEBOOK',
                email_verified: true,
            },
        })
    } else if (user.authMethod !== 'FACEBOOK') {
        res.status(400).send('wrongAuthMethod' + user.authMethod)
        return
    }

    const token = signJwt(user)
    res.cookie('token', token, { sameSite: 'none', secure: true })
    res.status(200).send(formatUser(user))
    return
}

export async function ConfirmEmail(req: Request, res: Response) {
    const confirmID = req.params.confirmId
    const users = await prisma.user.findMany({
        where: {
            email_confirm_id: confirmID,
        },
    })
    if (users.length === 0) {
        res.status(400).json('invalidConfirmId')
        return
    }

    if (users.length > 1) {
        res.sendStatus(500)
        return
    }
    const user = users[0]
    if (user.email_verified === true) {
        res.status(400).json('alreadyValidated')
        return
    }

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            email_verified: true,
        },
    })
    res.status(200).json('mailConfirmed')
}

export async function ForgotPwd(req: Request, res: Response) {
    const { email } = req.body

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    })
    if (!user) {
        res.status(200).send('emailSent')
        return
    }

    if (user.authMethod !== 'EMAIL') {
        res.status(400).send('wrongAuthMethod' + user.authMethod)
        return
    }

    // generate a link to reset pwd
    const confirmID: string = generateId()
    // amend profile with the code
    const retour = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            reset_pwd: confirmID,
        },
    })
    console.log(retour)

    // send Email
    const emailBody: string = generateEmailBodyForgotPwd(user.username, confirmID)
    sendEmail('Reset your password', email, emailBody)

    res.status(200).send('emailSent')
}

export async function ConfirmForgotPwd(req: Request, res: Response) {
    const confirmID = req.params.confirmId
    const users = await prisma.user.findMany({
        where: {
            reset_pwd: confirmID,
        },
    })
    if (users.length !== 1) {
        res.status(400).send('invalidConfirmId')
        return
    }
    res.status(200).send('validConfirmId')
}

export async function ResetPwd(req: Request, res: Response) {
    const confirmID = req.params.confirmId
    const { password } = req.body

    const users = await prisma.user.findMany({
        where: {
            reset_pwd: confirmID,
            authMethod: 'EMAIL',
        },
    })
    if (users.length !== 1) {
        res.status(400).json('invalidConfirmId')
        return
    }
    //amend pwd
    const retour = await prisma.user.update({
        where: {
            id: users[0].id,
        },
        data: {
            password: bcrypt.hashSync(password, users[0].salt || ''), // users[0].salt is not null if authMethod is email, but typescript doesn't know that
            reset_pwd: null,
        },
    })
    res.status(200).json('pwdReseted')
}

export async function SignOut(req: Request, res: Response) {
    res.clearCookie('token')
    res.status(200).send('signOut')
}
