import Custom404 from '../404'
import Loading from '../../components/Loading'
import UserNotSignedIn from '../../components/auth/UserNotSignedIn'
import MainLayout from '../../layouts/MainLayout'
import { useUserContext } from '../../src/context/UserContext'
import { TUserProfile } from '../../src/shared/user'
import axios from 'axios'
import type { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

function ProfilePage() {
    const { user } = useUserContext()
    const router = useRouter()
    const { profileid } = router.query
    const id = typeof profileid === 'string' ? profileid : ''
    const [userProfile, setUserProfile] = useState<TUserProfile | null>(null)
    const [idUser, setIdUser] = useState<number>(-1)
    const { t } = useTranslation('common')
    const [loading, setLoading] = useState<boolean>(true)
    const [currLink, setCurrLink] = useState<string>('no')
    const [error, setError] = useState<boolean>(false)

    let link = './norminet.jpeg'
    if (userProfile?.profilePicture)
        link = `http://localhost:5001/web/users/image/${userProfile.profilePicture}`

    useEffect(() => {
        setId()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setId()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    useEffect(() => {
        setId()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    useEffect(() => {
        void getUserInfo()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idUser])

    useEffect(() => {
        if (router.pathname.match('/settings')) setCurrLink('/settings')
        else setCurrLink('no')
    }, [currLink])

    async function likeMovie(movieId: any) {
        try {
            await axios.get(`http://localhost:5001/web/movies/like/${movieId}`, {
                withCredentials: true,
            })
        } catch {
            // setMovieDetails(null)
        }
    }

    function handleLike(movieId: any) {
        void likeMovie(movieId)
    }

    function setId() {
        if (user && id) {
            const newId = parseInt(id)
            if (!isNaN(newId) && newId > 0) {
                setIdUser(newId)
            }
        } else if (user) {
            setIdUser(user.id)
        }
    }

    async function getUserInfo() {
        if (!(idUser > 0)) return
        try {
            const response = await axios.get(`http://localhost:5001/web/users/profile/${idUser}`, {
                withCredentials: true,
            })
            setUserProfile(response.data)
        } catch (error: any) {
            setUserProfile(null)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    const removeItem = (index: number, itemId: number) => {
        if (userProfile) {
            const newData = { ...userProfile }
            newData.moviesLiked = [...userProfile.moviesLiked]
            newData.moviesLiked.splice(index, 1)
            setUserProfile(newData)
            handleLike(itemId)
        }
    }

    interface ImageListProps {
        title: string
        items: any[]
        button: boolean
    }

    const ImageList: React.FC<ImageListProps> = ({ title, items, button }) => (
        <div className="relative flex flex-none mr-5 mt-10">
            <div className="absolute px-1 left-0 -top-9 flex flex-row items-center w-full">
                <p className="text-xl font-bold text-orange-50 sm:text-2xl whitespace-nowrap">
                    {title}
                </p>
                <hr className="mt-1 ml-2 grow h-px bg-gray-200 border-0 dark:bg-gray-700" />
            </div>
            {items.map((element: any, index: any) => (
                <div key={index} className={`relative group my-2 mr-2`}>
                    <Link href={`/movie/${element.imdb_code}`}>
                        <img
                            src={element.thumbnail || '/errorPicture.jpg'}
                            alt={element.title + index}
                            className="h-[195px] border-2 border-gray-700 rounded-lg min-[1500px]:h-[13vw]"
                            onError={(e) => {
                                e.currentTarget.src = '/errorPicture.jpg'
                            }}
                        />
                    </Link>
                    {button && (
                        <button
                            className={`absolute top-0 right-0 mt-1 mr-1 bg-black rounded hidden group-hover:block bg-opacity-50 hover:bg-opacity-70`}
                            onClick={() => removeItem(index, element.imdb_code)}
                        >
                            <svg
                                className="w-6 h-6 text-orange-50 hover:text-orange-50 hover:duration-300 ease-in"
                                viewBox="0 0 24 24"
                            >
                                <g strokeWidth="0"></g>
                                <g strokeLinecap="round" strokeLinejoin="round"></g>
                                <g>
                                    <path
                                        fill="currentColor"
                                        d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z"
                                    ></path>
                                </g>
                            </svg>
                        </button>
                    )}
                </div>
            ))}
        </div>
    )

    let content

    if (!user) {
        content = <UserNotSignedIn />
    } else if (loading) {
        content = <Loading />
    } else if (error || !userProfile) {
        content = <Custom404 />
    } else {
        content = (
            <div className="mb-24">
                <MainLayout className2="" />
                <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden -z-10">
                    <img
                        src={'/defaultBackground.jpg'}
                        alt="profileBackground"
                        className="object-cover w-full h-full top-10 brightness-50"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = '/defaultBackground.jpg'
                        }}
                    />
                </div>
                <div className="flex flex-col sm:h-24 items-center relative overflow-hidden m-5 py-5 justify-center sm:pl-20 sm:max-w-md bg-gray-800 rounded-lg">
                    <img
                        src={link || '/norminet.jpeg'}
                        alt="Profile Picture"
                        className="relative sm:absolute sm:-left-[16px] sm:-top-4 left-0 w-32 h-32 mb-3 rounded-full shadow-lg"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = '/norminet.jpeg'
                        }}
                    />
                    <p className="text-lg font-bold text-white sm:text-xl">
                        {userProfile.firstName} {userProfile.lastName}
                    </p>
                    <Link href={'/settings'}>
                        <p
                            className="absolute rounded-md right-2 top-2 block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                            aria-current="page"
                            onClick={() => setCurrLink('/settings')}
                        >
                            {t('Edit')}
                        </p>
                    </Link>
                </div>
                <div className="relative h-full m-5 px-5 pt-2 bg-gray-800 rounded-lg">
                    <p className="mb-5 text-2xl font-bold text-white sm:text-3xl">
                        {userProfile.username}
                    </p>
                    <div className="flex overflow-auto">
                        {userProfile.moviesLiked.length > 0 && (
                            <ImageList
                                title={t('profile.likedFilms')}
                                items={userProfile.moviesLiked}
                                button={true}
                            />
                        )}
                    </div>
                    <div className="flex overflow-auto">
                        {userProfile.moviesViewed.length > 0 && (
                            <ImageList
                                title={t('profile.viewedFilms')}
                                items={userProfile.moviesViewed}
                                button={false}
                            />
                        )}
                    </div>
                    {!userProfile.moviesLiked.length && !userProfile.moviesViewed.length && (
                        <div className="w-full text-center h-28">
                            <p className="text-2xl font-bold text-white sm:text-3xl">
                                Here your future movies history.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return content
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return { props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) } }
}

export default ProfilePage
