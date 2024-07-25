import { useTranslation } from 'next-i18next'
import React from 'react'

interface RatingStarsProps {
    rating: number
    line: boolean
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, line }) => {
    rating = parseFloat(rating.toFixed(1))
    const filledStars = Math.floor(rating)
    const hasHalfStar = rating - filledStars >= 0.5
    const { t } = useTranslation('common')

    const renderStars = () => {
        const stars: JSX.Element[] = []

        for (let i = 0; i < filledStars; i++) {
            stars.push(
                <svg
                    key={i}
                    className="w-4 h-4 text-orange-50"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                </svg>,
            )
        }

        if (hasHalfStar) {
            stars.push(
                <svg key="half" className="w-4 h-4" fill="currentColor" viewBox="0 0 22 20">
                    <path
                        className="text-orange-50"
                        d="M11 .4A1.523 1.523 0 009.624 1.27L7.365 5.847l-5.051.734A1.535 1.535 0 001.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 002.226 1.616L11 17.033Z"
                    />
                    <path
                        className="text-gray-300 dark:text-gray-500"
                        d="M20.924 7.625a1.523 1.523 0 00-1.238-1.044l-5.051-.734L12.376 1.27A1.523 1.523 0 0011 .4L11 17.033 15.518 19.408a1.534 1.534 0 002.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 00.387-1.575Z"
                    />
                </svg>,
            )
        }

        const emptyStarsCount = 5 - filledStars - (hasHalfStar ? 1 : 0)
        for (let i = 0; i < emptyStarsCount; i++) {
            stars.push(
                <svg
                    key={`empty-${i}`}
                    className="w-4 h-4 text-gray-300 dark:text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                </svg>,
            )
        }

        return stars
    }

    return (
        <div className={`flex flex-${line ? 'row' : 'col'} items-center`}>
            <div className={`flex items-center mb-${line ? '1' : '0'}`}>{renderStars()}</div>
            <div className={`flex items-center ms-${line ? '1' : '0'}`}>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {rating.toFixed(1)}
                </p>
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('movie.rateOf')}
                </p>
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">5</p>
            </div>
        </div>
    )
}

export default RatingStars
