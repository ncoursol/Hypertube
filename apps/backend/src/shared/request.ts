import { CommentPrisma } from './comment'
import { Request } from 'express'
import Jwt from 'jsonwebtoken'

export interface RequestWithUser extends Request {
    user?: Jwt.JwtPayload
}

export interface requestWithRessource extends RequestWithUser {
    comment?: CommentPrisma
}
