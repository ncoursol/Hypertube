import MainLayout from '../layouts/MainLayout'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import React from 'react'

export default function Custom404() {
    const { t } = useTranslation('common')
    return (
        <MainLayout>
            <div className="text-center">
                <p className="text-8xl font-semibold text-indigo-600">404</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    {t('404.lostPage')}
                </h1>
                <p className="mt-6 text-base leading-7 text-gray-600">{t('404.sorry')}</p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link href="/">
                        <p className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            {t('getBack')}
                        </p>
                    </Link>
                </div>
            </div>
        </MainLayout>
    )
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    }
}
