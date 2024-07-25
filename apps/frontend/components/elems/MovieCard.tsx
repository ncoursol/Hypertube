import { MovieDTO } from '../../src/shared/movies'
import { formatDuration } from '../../src/utils'
import RatingStars from './RatingStars'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export function MovieCard({ movie }: { movie: MovieDTO }) {
    const [colorHeart, setColorHeart] = useState<string>('white')
    const { t } = useTranslation('common')

    useEffect(() => {
        setColorHeart(movie.liked ? 'orange-50' : 'white')
    }, [])

    return (
        <div className="relative group overflow-hidden cursor-pointer">
            <Link href={`/movie/${movie.imdb_code}?source=${movie.source}`}>
                <img
                    src={movie.thumbnail}
                    alt={movie.title}
                    width={230}
                    height={345}
                    className={`w-full h-auto`}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = '/errorPicture.jpg'
                    }}
                />
                <div className="absolute p-5 pt-8 w-full h-full top-0 left-0 text-center bg-black hidden group-hover:block bg-opacity-80 ">
                    <div className="text-xl text-white font-extrabold mb-2 h-2/5 overflow-auto">
                        {movie.title}
                    </div>
                    <RatingStars
                        rating={movie.imdbRating ? movie.imdbRating / 2 : 0}
                        line={false}
                    />
                    <p className="ml-2 mr-4 text-slate-200 text-bold mt-2">
                        {t('index.release')}: {movie.year.toString()}
                    </p>
                    <p className="ml-2 mr-4 text-slate-200 text-bold mt-1">
                        {t('index.duration')}: {formatDuration(movie.length)}
                    </p>
                </div>
                <svg
                    className={`absolute top-0 left-0 p-1 ml-2 w-8 h-8 text-blue-50 opacity-${
                        movie.viewed ? '100' : '0'
                    } bg-black rounded-b bg-opacity-50 group-hover:bg-opacity-0`}
                    viewBox="0 -4 24 24"
                >
                    <g strokeWidth="0"></g>
                    <g strokeLinecap="round" strokeLinejoin="round"></g>
                    <g>
                        <path
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M13.2891 5.29237C13.1078 5.47338 12.9957 5.72359 12.9957 6C12.9957 6.5523 13.4434 7 13.9957 7C14.2721 7 14.5223 6.8879 14.7033 6.7066C14.8907 7.0982 14.9957 7.5369 14.9957 8C14.9957 9.6569 13.6525 11 11.9957 11C10.3388 11 8.99568 9.6569 8.99568 8C8.99568 6.3431 10.3388 5 11.9957 5C12.4588 5 12.8975 5.10495 13.2891 5.29237zM11.9967 16C7.69743 16 3.82272 13.7042 0.407613 9.2101C-0.135884 8.4948 -0.135868 7.505 0.407642 6.7899C3.82274 2.29581 7.69744 0 11.9967 0C16.2961 0 20.1708 2.29582 23.5859 6.7899C24.1294 7.5052 24.1294 8.495 23.5859 9.2101C20.1708 13.7042 16.2961 16 11.9967 16zM11.9957 13C14.7571 13 16.9957 10.7614 16.9957 8C16.9957 5.23858 14.7571 3 11.9957 3C9.23425 3 6.99568 5.23858 6.99568 8C6.99568 10.7614 9.23425 13 11.9957 13z"
                        ></path>
                    </g>
                </svg>
                <svg
                    className={`absolute top-0 right-0 p-1 mr-2 w-8 h-8 text-${colorHeart} opacity-${
                        movie.liked ? '100' : '0'
                    } bg-black rounded-b bg-opacity-50 group-hover:bg-opacity-0`}
                    viewBox="2 2 27 28"
                >
                    <path
                        fill="currentColor"
                        d="M26.996 12.898c-.064-2.207-1.084-4.021-2.527-5.13-1.856-1.428-4.415-1.69-6.542-.132-.702.516-1.359 1.23-1.927 2.168-.568-.938-1.224-1.652-1.927-2.167-2.127-1.559-4.685-1.297-6.542.132-1.444 1.109-2.463 2.923-2.527 5.13-.035 1.172.145 2.48.788 3.803 1.01 2.077 5.755 6.695 10.171 10.683l.035.038.002-.002.002.002.036-.038c4.415-3.987 9.159-8.605 10.17-10.683.644-1.323.822-2.632.788-3.804z"
                    ></path>
                </svg>
            </Link>
        </div>
    )
}
