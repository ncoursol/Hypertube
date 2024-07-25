export interface CommentDTO {
    id: number
    content: string
    updatedAt: Date
    username: string
    profilePicture: string | null
    userId: number
}

export interface CommentPrisma {
    id: number
    text: string
    updatedAt: Date
    user: {
        id: number
        username: string
        profile_picture: string | null
    }
}

export interface MovieCommentPrisma {
    id: number
    comments: CommentPrisma[]
}
