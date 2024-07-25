import MainLayout from '../../layouts/MainLayout'
import { useUserContext } from '../../src/context/UserContext'
import axios from 'axios'
import type { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'

export default function Login42(): JSX.Element {
    const { loginUser } = useUserContext()
    const router = useRouter()
    const { method } = router.query
    const [error, setError] = useState(false)
    const { t } = useTranslation('common')

    const oauth = async () => {
        try {
            const url = new URL(window.location.href)
            const code = url.searchParams.get('code')
            const errorParam = url.searchParams.get('error')
            if (errorParam) setError(true)
            if (code) {
                const url = 'http://localhost:5001/web/auth/' + String(method)
                const res = await axios.post(url, { code }, { withCredentials: true })
                loginUser(res.data)
                void router.push('/')
            }
        } catch (err) {
            // console.error(err)
            setError(true)
        }
    }

    useEffect(() => {
        if (['42', 'github', 'facebook'].includes(method as string)) {
            void oauth()
        }
    }, [method])

    // Display a centered error message in a card
    if (error) {
        return (
            <MainLayout
                className="min-h-screen bg-black flex flex-col"
                className2="flex flex-grow justify-center items-center mt-4 px-5"
            >
                <div className="block max-w-sm p-6 border rounded-lg shadow bg-gray-800 border-gray-700">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
                        {t('login.authFail')}
                    </h5>
                    <p className="font-normal text-gray-400 mb-4">{t('login.accountTryAgain')}</p>
                    <a
                        href="/signin"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        {t('login.tryAgain')}
                        <svg
                            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 10"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 5h12m0 0L9 1m4 4L9 9"
                            />
                        </svg>
                    </a>
                </div>
            </MainLayout>
        )
    }

    return (
        <div>
            <img
                src="https://mir-s3-cdn-cf.behance.net/project_modules/fs/725eef121244331.60c1c7928b5dd.gif"
                alt="loading"
            />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return { props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) } }
}
