import authRoutes from './auth.ts'
import commentsRoutes from './comments.ts'
import moviesRoutes from './movies.ts'
import usersRoutes from './users.ts'
import express, { Router } from 'express'

const router: Router = express.Router()

router.use('/users', usersRoutes)
router.use('/movies', moviesRoutes)
router.use('/auth', authRoutes)
router.use('/comments', commentsRoutes)

export default router
