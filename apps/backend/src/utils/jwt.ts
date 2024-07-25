import jwt from 'jsonwebtoken'

export const signJwt = (user: any) => {
    return jwt.sign(
        { user_id: user.id, username: user.username, email: user.email },
        process.env.TOKEN_KEY || '',
        { expiresIn: '1d' },
    )
}
