import {
    deleteImg,
    dowloadImg,
    getListUsers,
    getMe,
    getProfile,
    getUser,
    updateSettings,
    uploadImg,
} from '../controllers/users'
import verifyToken from '../middleware/auth.middleware'
import { imageFileFilter } from '../middleware/photo-middleware'
import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { createValidator } from 'express-joi-validation'
import Joi from 'joi'

const router: Router = express.Router()

const validator = createValidator()

const updateSchema = Joi.object({
    email: Joi.string().email().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    language: Joi.string().required(),
})

const idShema = Joi.object({
    id: Joi.number().required(),
})

router.get('/me', verifyToken, asyncHandler(getMe))

router.get('/', verifyToken, asyncHandler(getListUsers))

router.get('/:id', verifyToken, validator.params(idShema), asyncHandler(getUser))

router.get('/profile/:id', verifyToken, validator.params(idShema), asyncHandler(getProfile))

router.post(
    '/updatesettings',
    verifyToken,
    validator.body(updateSchema),
    asyncHandler(updateSettings),
)

router.post('/image', verifyToken, asyncHandler(uploadImg))

router.get('/image/:filename', verifyToken, imageFileFilter, asyncHandler(dowloadImg))

router.delete('/image/:filename', verifyToken, imageFileFilter, asyncHandler(deleteImg))

export default router
