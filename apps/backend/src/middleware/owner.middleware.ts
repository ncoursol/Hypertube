import { requestWithRessource } from '../shared/request'
import { NextFunction, Response } from 'express'

export const isCommentOwner = (req: requestWithRessource, res: Response, next: NextFunction) => {
    if (req.user!.user_id !== req.comment!.user.id) {
        console.log('===============', req.user!.user_id, req.comment!.user.id)
        return res.status(403).send('unauthorized')
    }
    return next()
}
