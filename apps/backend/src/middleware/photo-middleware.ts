import { EmptyPhotoId, InvalidPhotoId } from '../shared/msg-error'
import { Request, Response } from 'express'

export function imageFileFilter(req: Request, res: Response, next: any) {
    const { filename } = req.params
    if (!filename) {
        return res.status(400).send(EmptyPhotoId)
    }
    if (!filename.match(/\.(jpg|jpeg|png|gif)$/)) {
        return res.status(400).send(InvalidPhotoId)
    }
    // if (!filename.match(/^\d+_/)) {
    // 	return res
    // 	.status(400)
    // 	.send({ message: ErrorMsg, error: InvalidPhotoId });
    // }

    next()
}
