import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import ContentEditable from 'react-contenteditable'
import sanitizeHtml from 'sanitize-html'

interface CommentProps {
    content: string
    updatedAt: Date
    username: string
    profilePicture?: string
    userId: number
    additionalClasses?: string
    handleDelete: () => void
    handleEdit: (content: string) => void
    mine: boolean
}

export const COMMENT_MAX_LENGTH = 300

export const isValidCommentLength = (comment: string) =>
    1 <= comment.length && comment.length <= COMMENT_MAX_LENGTH

function doubleBrEnding(str: string) {
    // Regular expression to match strings that end with '<br>' or '<br />'
    const regex = /(?:[^>]|^)(<br>|<br \/>)$/

    // Check if the string matches the regular expression
    if (regex.test(str)) {
        // If it matches, double the ending
        return str + str.match(regex)![1]
    }

    // If it doesn't match, return the original string
    return str
}

const Comment: React.FC<CommentProps> = (props: CommentProps) => {
    const router = useRouter()
    const initialLanguage = router.locale || router.defaultLocale || 'en'
    const {
        content,
        updatedAt,
        username,
        profilePicture,
        userId,
        additionalClasses,
        handleDelete,
        handleEdit,
        mine,
    } = props
    const [editableContent, setEditableContent] = useState('')
    const [originalContent, setOriginalContent] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const { t } = useTranslation('common')

    const onContentChange = React.useCallback((evt: any) => {
        const sanitizeConf = {
            allowedTags: ['b', 'i', 'a', 'p', 'br'],
            allowedAttributes: { a: ['href'] },
        }
        //console.log('change')
        //console.log(evt.currentTarget.innerHTML)
        //console.log(doubleBrEnding(sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf)))
        setEditableContent(doubleBrEnding(sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf)))
    }, [])

    useEffect(() => {
        if (isValidCommentLength(content)) {
            setEditableContent(content)
            setOriginalContent(content)
        }
    }, [content])

    const date = new Date(updatedAt)
    const dateTime = date.getDate().toString()
    const longFormat = date.toLocaleString(initialLanguage, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    })
    const abbreviatedFormat = date.toLocaleDateString(initialLanguage, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

    const handleConfirm = async () => {
        handleEdit(editableContent)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditableContent(originalContent)
        setIsEditing(false)
    }

    return (
        <article
            className={'pt-6 mb-2 text-base bg-neutral-900 border-gray-700 ' + additionalClasses}
        >
            <footer className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    <Link
                        href={`/profile/${userId}`}
                        className="inline-flex items-center mr-3 font-semibold text-sm text-white"
                    >
                        <img
                            className="mr-2 w-6 h-6 rounded-full"
                            src={
                                profilePicture
                                    ? `http://localhost:5001/web/users/image/${profilePicture}`
                                    : 'https://s3.amazonaws.com/37assets/svn/765-default-avatar.png'
                            }
                            alt={`{username}'s profile picture'`}
                        />
                        {username}
                    </Link>
                    <p className="text-sm text-gray-400">
                        <time dateTime={dateTime} title={longFormat}>
                            {abbreviatedFormat}
                        </time>
                    </p>
                </div>
            </footer>
            <ContentEditable
                className={
                    'mb-4 break-words ' + (isEditing ? 'border rounded border-gray-700' : '')
                }
                onChange={onContentChange}
                html={editableContent}
                disabled={!isEditing}
            />
            {mine && (
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                className={`font-medium ${
                                    isValidCommentLength(editableContent)
                                        ? 'text-blue-500 hover:underline'
                                        : 'text-red-500'
                                }`}
                                onClick={handleConfirm}
                                disabled={!isValidCommentLength(editableContent)}
                            >
                                {t('movie.confirm')}
                            </button>
                            <button
                                className="font-medium text-red-500 hover:underline"
                                onClick={handleCancel}
                            >
                                {t('movie.cancel')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="font-medium text-blue-500 hover:underline"
                                onClick={() => setIsEditing(true)}
                            >
                                {t('movie.edit')}
                            </button>
                            <button
                                className="font-medium text-red-500 hover:underline"
                                onClick={handleDelete}
                            >
                                {t('movie.delete')}
                            </button>
                        </>
                    )}
                </div>
            )}
        </article>
    )
}

export default Comment
