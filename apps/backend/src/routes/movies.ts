import { getMovieComments } from '../controllers/comments'
import {
    getMovieInfo,
    getMovies,
    getSubtitle,
    likeMovie,
    testDownload,
    testSub,
    viewMovie,
} from '../controllers/movies'
import verifyToken from '../middleware/auth.middleware'
import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { createValidator } from 'express-joi-validation'
import Joi from 'joi'

const router: Router = express.Router()

const validator = createValidator()

const movieSchema = Joi.object({
    type: Joi.string(),
    genre: Joi.string(),
    downloaded: Joi.string(),
    minGrade: Joi.number(),
    year: Joi.number(),
    language: Joi.string(),
    sortBy: Joi.string(),
    search: Joi.string(),
    limit: Joi.number().required(),
    offset: Joi.number().required(),
})

const imdbIdSchema = Joi.object({
    movieId: Joi.string(),
})

const myImdbSchema = Joi.object({
    movieId: Joi.string().regex(/tt/, 'imdbCode').required(),
})

router.get('/', verifyToken, validator.query(movieSchema), asyncHandler(getMovies))

// router.get('/test', verifyToken, asyncHandler(testDownload))

router.get('/:movieId', verifyToken, validator.params(imdbIdSchema), asyncHandler(getMovieInfo))

router.get('/like/:movieId', verifyToken, validator.params(imdbIdSchema), asyncHandler(likeMovie))

router.get('/view/:movieId', verifyToken, validator.params(imdbIdSchema), asyncHandler(viewMovie))

router.get(
    '/subtitle/:movieId',
    verifyToken,
    validator.params(imdbIdSchema),
    asyncHandler(getSubtitle),
)

// router.get('/testsub/:movieId', verifyToken, validator.params(imdbIdSchema), asyncHandler(testSub))

router.get(
    '/:movieId/comments',
    verifyToken,
    validator.params(myImdbSchema),
    asyncHandler(getMovieComments),
)

export default router
