import Custom404 from '../404'
import Comment, { COMMENT_MAX_LENGTH, isValidCommentLength } from '../../components/Comment'
import Loading from '../../components/Loading'
import UserNotSignedIn from '../../components/auth/UserNotSignedIn'
import RatingStars from '../../components/elems/RatingStars'
import VideoPlayer from '../../components/video/VideoPlayer'
import MainLayout from '../../layouts/MainLayout'
import { useUserContext } from '../../src/context/UserContext'
import { CommentDTO } from '../../src/shared/comment'
import { MovieCrew } from '../../src/shared/movies'
import { MovieDetails } from '../../src/shared/movies'
import { formatDuration } from '../../src/utils'
import axios from 'axios'
import type { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import sanitizeHtml from 'sanitize-html'

const pluralize = (name: string, arr: MovieCrew[]) => (arr.length >= 2 ? name + 's' : name)

function MoviePage() {
    const { user } = useUserContext()
    const [movie, setMovieDetails] = useState<MovieDetails | null>(null)
    const [liked, setLiked] = useState<boolean>(false)
    const router = useRouter()
    const { movieid } = router.query
    const source = router.query.source ? router.query.source : 'YTS'
    const [comment, setComment] = useState<string>('')
    const [comments, setComments] = useState<CommentDTO[]>([])
    const { t } = useTranslation('common')
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<boolean>(false)
    const [isModalVisible, setModalVisible] = useState(false)
    const [isMovieVisible, setMovieVisible] = useState(false)

    useEffect(() => {
        if (movieid) getMovie()
    }, [movieid])

    const canPostComment = (): boolean => isValidCommentLength(comment)

    async function getMovie() {
        try {
            const response = await axios.get(
                `http://localhost:5001/web/movies/${String(movieid)}`,
                {
                    params: {
                        source: source,
                    },
                    withCredentials: true,
                },
            )
            setMovieDetails(response.data)
            if (response.data.liked) setLiked(response.data.liked)

            const responseComments = await axios.get(
                `http://localhost:5001/web/movies/${String(movieid)}/comments`,
                { withCredentials: true },
            )
            setComments(responseComments.data)
        } catch {
            setMovieDetails(null)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    async function postComment() {
        const sanitizeConf = {
            allowedTags: ['b', 'i', 'a', 'p', 'br'],
            allowedAttributes: { a: ['href'] },
        }

        if (canPostComment()) {
            const formattedComment = sanitizeHtml(comment.replace('\n', '<br>'), sanitizeConf)
            try {
                const response = await axios.post(
                    `http://localhost:5001/web/comments/`,
                    {
                        comment: formattedComment,
                        imdbCode: movieid,
                    },
                    {
                        withCredentials: true,
                    },
                )
                setComments((prevComments) => [response.data, ...prevComments])
            } catch (errorMsg: any) {
                // console.log(errorMsg.response.data)
            }
            setComment('')
        }
    }

    async function handleDeleteComment(id: number) {
        try {
            await axios.delete(`http://localhost:5001/web/comments/${id}`, {
                withCredentials: true,
            })
            setComments((prevComments) => prevComments.filter((el) => el.id !== id))
        } catch (errorMsg: any) {
            // console.log(errorMsg)
        }
    }

    async function handleEditComment(id: number, content: string) {
        try {
            await axios.patch(
                `http://localhost:5001/web/comments/${id}`,
                { comment: content },
                { withCredentials: true },
            )
            setComments((prevComments) =>
                prevComments.map((el) => {
                    if (el.id === id) {
                        el.content = content
                    }
                    return el
                }),
            )
        } catch {
            // console.log()
        }
    }

    async function likeMovie() {
        try {
            const response = await axios.get(
                `http://localhost:5001/web/movies/like/${String(movieid)}`,
                {
                    withCredentials: true,
                },
            )
            setLiked(response.data === 'Movie liked')
        } catch {
            // setMovieDetails(null)
        }
    }

    function handleLike() {
        likeMovie()
    }

    const searchInCrew = (job: string[]): MovieCrew[] => {
        if (!movie || !movie.crews) {
            return []
        }
        return movie.crews.filter((crew) => job.includes(crew.job as string))
    }

    const handleToggleModal = () => {
        setModalVisible(!isModalVisible)
    }

    const handleToggleMovie = () => {
        setMovieVisible(!isMovieVisible)
    }

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.key === 'Escape' && isModalVisible) {
                handleToggleModal()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isModalVisible, handleToggleModal])

    const directors = searchInCrew(['Director'])
    const writers = searchInCrew(['Story', 'Writer'])
    const producers = searchInCrew(['Producer'])
    const recommended = movie ? movie.recommended : []

    const ImageList = ({ title, items }: { title: any; items: any }) => (
        <div className="relative pl-2 flex flex-none mr-5 my-12">
            {title && (
                <div className="absolute px-1 left-0 -top-9 flex flex-row items-center w-full">
                    <p className="text-xl font-bold text-orange-50 sm:text-2xl">{title}</p>
                    <hr className="mt-1 ml-2 grow h-px bg-gray-200 border-0 dark:bg-gray-700" />
                </div>
            )}
            {items.map((element: any, index: any) => (
                <div key={index} className="relative my-2 mr-2">
                    <img
                        src={element.image || '/errorPicture.jpg'}
                        alt={element.name + index}
                        className="h-[195px] border-2 border-gray-700 rounded-t-lg min-[1500px]:h-[13vw]"
                        onError={(e) => {
                            e.currentTarget.src = '/errorPicture.jpg'
                        }}
                    />
                    <div className="absolute pl-1 -bottom-15 rounded-b w-full border-x-2 border-b-2 border-gray-700">
                        <p className="text-xs font-bold truncate md:text-sm">{element.name}</p>
                        <p className="text-xs truncate md:text-sm">{element.character}</p>
                    </div>
                </div>
            ))}
        </div>
    )

    let content

    if (!user) {
        content = <UserNotSignedIn />
    } else if (loading) {
        content = <Loading />
    } else if (error || !movie) {
        content = <Custom404 />
    } else {
        content = (
            <div>
                <MainLayout className2="bg-black" />
                <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden -z-10">
                    <img
                        src={movie.image.background || '/defaultBackground.jpg'}
                        alt={movie.title}
                        className="object-cover w-full h-full top-10 brightness-50"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = '/defaultBackground.jpg'
                        }}
                    />
                </div>
                <div
                    className={`flex justify-center transition-all transform duration-500 ${
                        isMovieVisible ? 'h-[40vw] max-h-[40vh] my-[10vw]' : 'h-[18vh]'
                    }`}
                >
                    {isMovieVisible && (
                        <div className="flex justify-center items-center">
                            <VideoPlayer videoID={movie.imdb_code} />
                        </div>
                    )}
                </div>
                <div className="relative">
                    <img
                        src={movie.image.poster || '/errorPicture.jpg'}
                        alt={movie.title}
                        className={`absolute w-1/4 top-4 z-10 left-[3%] rounded-lg invisible shadow-lg shadow-orange-50 min-[770px]:visible min-[770px]:transition-all transform min-[770px]:duration-500 ${
                            isMovieVisible ? 'min-[1000px]:top-4' : 'min-[1000px]:-top-20'
                        }`}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = '/errorPicture.jpg'
                        }}
                    />
                    <div className="flex flex-col pl-10 pb-3 bg-neutral-800 w-full bg-opacity-80 min-[770px]:pl-[31vw] min-[950px]:flex-row">
                        <div className="w-full min-[950px]:w-[53vw]">
                            <h1 className="py-2 pr-5 text-2xl font-bold text-slate-200 truncate sm:text-4xl">
                                {movie.title}
                            </h1>
                            <RatingStars rating={movie.rating / 2} line={true} />
                            <div className="flex flex-wrap">
                                {movie.genres.map((element, index) => (
                                    <Link
                                        key={index}
                                        href={{
                                            pathname: '/',
                                            query: { genre: element },
                                        }}
                                        className="mr-2 mt-2 bg-blue-50 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded hover:bg-blue-60 active:bg-blue-70"
                                    >
                                        {t(`index.genre.${element.toLowerCase()}`)}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-row grow mt-4 ml-2 min-[950px]:justify-end min-[950px]:mt-0">
                            <button className="mr-10" onClick={handleToggleMovie}>
                                <svg
                                    className="w-5 h-5 text-slate-200 hover:text-orange-50 hover:duration-300 ease-in"
                                    fill="currentColor"
                                    viewBox="0 0 13 16"
                                >
                                    <path d="M0 0V16l13-8Z"></path>
                                </svg>
                            </button>
                            <button className="mr-10" onClick={handleToggleModal}>
                                <svg
                                    className="w-6 h-6 text-slate-200 hover:text-blue-50 hover:duration-300 ease-in"
                                    fill="currentColor"
                                    viewBox="0 0 23 23"
                                >
                                    <path d="M19 4v1h-2V3H7v2H5V3H3v18h2v-2h2v2h10v-2h2v2h2V3h-2v1zM5 7h2v2H5V7zm0 4h2v2H5v-2zm0 6v-2h2v2H5zm12 0v-2h2v2h-2zm2-4h-2v-2h2v2zm-2-4V7h2v2h-2z"></path>
                                </svg>
                            </button>
                            <button className="mr-[10%]" onClick={handleLike}>
                                <svg
                                    className={`w-6 h-6 text-${
                                        liked ? 'orange-50' : 'white'
                                    } hover:text-orange-50 hover:duration-300 ease-in`}
                                    viewBox="2 2 27 28"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M26.996 12.898c-.064-2.207-1.084-4.021-2.527-5.13-1.856-1.428-4.415-1.69-6.542-.132-.702.516-1.359 1.23-1.927 2.168-.568-.938-1.224-1.652-1.927-2.167-2.127-1.559-4.685-1.297-6.542.132-1.444 1.109-2.463 2.923-2.527 5.13-.035 1.172.145 2.48.788 3.803 1.01 2.077 5.755 6.695 10.171 10.683l.035.038.002-.002.002.002.036-.038c4.415-3.987 9.159-8.605 10.17-10.683.644-1.323.822-2.632.788-3.804z"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-neutral-900 grow pb-16">
                    <div className="text-slate-200 px-10 min-[770px]:pl-[31vw]">
                        <div className="py-3 w-auto flex flex-row items-center">
                            <svg className="w-6 h-6 text-orange-50" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 15H8M11 15H13M16 15H18M6 18H8M11 18H13M16 18H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                            </svg>
                            <p className="ml-2 mr-4 text-slate-200">{movie.year.toString()}</p>
                            <svg className="w-6 h-6 text-blue-50" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 7V12L14.5 10.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                            </svg>
                            <p className="ml-2 mr-4 text-slate-200">
                                {formatDuration(movie.runtime)}
                            </p>
                            <svg
                                className="w-8 h-8 text-yellow-500"
                                viewBox="0 0 48 48"
                                fill="none"
                            >
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g
                                    id="SVGRepo_tracerCarrier"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></g>
                                <g id="SVGRepo_iconCarrier">
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M10.4894 29.3487V34.5488C10.4894 35.6534 11.3848 36.5488 12.4894 36.5488H42.4894C43.5939 36.5488 44.4894 35.6534 44.4894 34.5488V18.5488C44.4894 17.4443 43.5939 16.5488 42.4894 16.5488H35.6339V18.5488H39.4905C39.491 18.9415 39.5686 19.3302 39.7188 19.693C39.8696 20.0569 40.0906 20.3877 40.3692 20.6662C40.6477 20.9448 40.9785 21.1658 41.3424 21.3166C41.7061 21.4672 42.0958 21.5448 42.4894 21.5449V31.5489C42.1014 31.5511 41.7174 31.6287 41.3588 31.7772C40.9948 31.928 40.6641 32.1489 40.3855 32.4275C40.1069 32.7061 39.886 33.0368 39.7352 33.4008C39.5844 33.7648 39.5068 34.1549 39.5068 34.5488H15.4852C15.4804 34.1677 15.403 33.7908 15.2571 33.4384C15.1063 33.0744 14.8853 32.7437 14.6067 32.4651C14.3282 32.1865 13.9975 31.9655 13.6335 31.8148C13.2707 31.6645 12.882 31.5869 12.4894 31.5864V29.3487H10.4894Z"
                                        fill="currentColor"
                                    ></path>
                                    <path
                                        d="M24.5106 21.4512C24.5106 23.6603 22.7198 25.4512 20.5106 25.4512C18.3015 25.4512 16.5106 23.6603 16.5106 21.4512C16.5106 19.242 18.3015 17.4512 20.5106 17.4512C22.7198 17.4512 24.5106 19.242 24.5106 21.4512Z"
                                        fill="currentColor"
                                    ></path>
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M5.51062 11.4512C4.40605 11.4512 3.51062 12.3466 3.51062 13.4512V29.4512C3.51062 30.5557 4.40605 31.4512 5.51062 31.4512H35.5106C36.6152 31.4512 37.5106 30.5557 37.5106 29.4512V13.4512C37.5106 12.3466 36.6152 11.4512 35.5106 11.4512H5.51062ZM8.50879 13.4512H32.5117C32.5122 13.8438 32.5898 14.2325 32.7401 14.5953C32.8908 14.9593 33.1118 15.29 33.3904 15.5686C33.669 15.8472 33.9997 16.0681 34.3637 16.2189C34.7273 16.3695 35.117 16.4471 35.5106 16.4473V26.4512C35.1226 26.4535 34.7386 26.531 34.38 26.6795C34.016 26.8303 33.6853 27.0513 33.4068 27.3299C33.1282 27.6084 32.9072 27.9391 32.7564 28.3031C32.6057 28.6671 32.5281 29.0572 32.5281 29.4512H8.50643C8.50165 29.07 8.42427 28.6931 8.2783 28.3407C8.12754 27.9767 7.90656 27.646 7.62799 27.3674C7.34941 27.0889 7.01869 26.8679 6.65472 26.7171C6.29196 26.5669 5.90324 26.4893 5.51062 26.4888L5.51062 16.4512C5.90396 16.4509 6.29343 16.3733 6.65684 16.2228C7.02082 16.072 7.35153 15.8511 7.63011 15.5725C7.90869 15.2939 8.12966 14.9632 8.28043 14.5992C8.43119 14.2352 8.50879 13.8451 8.50879 13.4512Z"
                                        fill="currentColor"
                                    ></path>
                                </g>
                            </svg>
                            <p className="ml-2 text-slate-200">
                                {movie.budget?.toLocaleString().toString()}$
                            </p>
                        </div>
                        {movie.summary && (
                            <div>
                                <div className="flex flex-row items-center w-full">
                                    <span className="mr-4 text-2xl font-extrabold sm:text-3xl">
                                        {t('movie.summary')}
                                    </span>
                                    <hr className="mt-2 grow h-px bg-gray-200 border-0 dark:bg-gray-700" />
                                </div>
                                <p className="pt-3 ml-4 text-lg tracking-wide sm:text-xl mb-10">
                                    {movie.summary}
                                </p>
                            </div>
                        )}
                        {(directors.length ||
                            writers.length ||
                            producers.length ||
                            movie.actors.length) && (
                            <div className="mb-10">
                                <div className="pt-4 flex flex-row items-center w-full">
                                    <span className="mr-4 text-2xl font-extrabold sm:text-3xl">
                                        {t('movie.casting')}
                                    </span>
                                    <hr className="mt-2 grow h-px bg-gray-200 border-0 dark:bg-gray-700" />
                                </div>
                                <div className="flex overflow-auto mt-2 ml-4">
                                    {directors.length > 0 && (
                                        <ImageList
                                            title={pluralize(t('movie.director'), directors)}
                                            items={directors}
                                        />
                                    )}
                                    {writers.length > 0 && (
                                        <ImageList
                                            title={pluralize(t('movie.writer'), writers)}
                                            items={writers}
                                        />
                                    )}
                                    {producers.length > 0 && (
                                        <ImageList
                                            title={pluralize(t('movie.producer'), producers)}
                                            items={producers}
                                        />
                                    )}
                                    {movie.actors.length > 0 && (
                                        <ImageList
                                            title={pluralize(t('movie.actor'), movie.actors)}
                                            items={movie.actors}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                        {recommended && (
                            <div className="mb-10">
                                <div className="pt-4 flex flex-row items-center w-full">
                                    <span className="mr-4 text-3xl font-extrabold">
                                        {t('movie.recommended')}
                                    </span>
                                    <hr className="mt-2 grow h-px bg-gray-200 border-0 dark:bg-gray-700" />
                                </div>
                                <div className="flex overflow-auto mt-6 pl-4">
                                    <div className="relative pl-2 flex flex-none mr-5">
                                        {recommended.map((element: any, index: any) => (
                                            <div key={index} className="relative my-2 mr-2">
                                                <a href={`/movie/${element.imdb_code}`}>
                                                    <img
                                                        src={
                                                            element.thumbnail || '/errorPicture.jpg'
                                                        }
                                                        alt={element.title + index}
                                                        className="h-[195px] border-2 border-gray-700 rounded-lg min-[1500px]:h-[13vw]"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                '/errorPicture.jpg'
                                                        }}
                                                    />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="pt-4 flex flex-row items-center w-full mb-4">
                            <span className="mr-4 text-3xl font-extrabold">
                                {t('movie.comments')}
                            </span>
                            <hr className="mt-2 grow h-px bg-gray-200 border-0 dark:bg-gray-700" />
                        </div>
                        <div className="mt-7 mb-4 ml-4">
                            <div
                                className={`py-2 px-4 mb-4 rounded-lg rounded-t-lg border bg-gray-800 border-gray-700 ${
                                    canPostComment()
                                        ? 'focus-within:border-blue-700'
                                        : 'focus-within:border-red-700'
                                }`}
                            >
                                <label htmlFor="comment" className="sr-only">
                                    {t('movie.yourComment')}
                                </label>
                                <textarea
                                    id="comment"
                                    rows={5}
                                    className="relative px-0 w-full text-sm border-0 text-white placeholder-gray-400 bg-gray-800 resize-none outline-none"
                                    placeholder={t('movie.writeComment')}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                                <label
                                    className={`text-sm text-${
                                        canPostComment() ? 'white' : 'red-500'
                                    }`}
                                >
                                    {comment.length}/{COMMENT_MAX_LENGTH}
                                </label>
                            </div>
                            <button
                                type="submit"
                                onClick={() => postComment()}
                                className={`inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800 ${
                                    canPostComment()
                                        ? 'bg-blue-700 hover:bg-primary-800 text-white'
                                        : 'bg-gray-500 hover:bg-gray-500 cursor-not-allowed'
                                }`}
                                disabled={!canPostComment()}
                            >
                                {t('movie.postComment')}
                            </button>
                        </div>
                        {comments.map((com, index) => (
                            <Comment
                                key={index}
                                content={com.content}
                                updatedAt={com.updatedAt}
                                username={com.username}
                                profilePicture={com.profilePicture}
                                userId={com.userId}
                                additionalClasses={index !== 0 ? 'border-t' : ''}
                                handleDelete={() => handleDeleteComment(com.id)}
                                handleEdit={(contents) => handleEditComment(com.id, contents)}
                                mine={com.userId === user.id}
                            />
                        ))}
                    </div>
                    {isModalVisible && (
                        <div
                            className="fixed flex z-50 w-full h-full justify-center items-center inset-0 bg-black bg-opacity-80"
                            onClick={handleToggleModal}
                        >
                            <iframe
                                src={`https://www.youtube.com/embed/${movie.yt_trailer_code}`}
                                title="YouTube video player"
                                className="w-[48vw] h-[27vw]"
                                allowFullScreen
                            />
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return content
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale as string, ['common'])),
    },
})

export default MoviePage
