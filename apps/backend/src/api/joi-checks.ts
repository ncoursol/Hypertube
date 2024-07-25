import Joi from 'joi'

export const patchUserSchema = Joi.object({
    email: Joi.string().email(),
    username: Joi.string(),
    password: Joi.string(),
    profile_picture: Joi.string(),
})

export const patchCommentSchema = Joi.object({
    username: Joi.string(),
    comment: Joi.string(),
})

export const postCommentSchema = Joi.object({
    movie_id: Joi.number().required(),
    comment: Joi.string().required(),
})

export const idShema = Joi.object({
    id: Joi.number().required(),
})
