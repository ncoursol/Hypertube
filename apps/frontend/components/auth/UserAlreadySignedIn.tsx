import MainLayout from '../../layouts/MainLayout'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React from 'react'

function UserAlreadySignedIn() {
    const { t } = useTranslation('common')
    return (
        <MainLayout>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        {t('UserAlreadySignedIn.alreadySign')}
                    </h2>
                    <Link href="/">
                        <p className="flex items-center justify-center px-3 mb:px-5 py-2 text-sm transition-colors duration-200 border rounded-lg gap-x-2 w-auto  bg-gray-900 text-gray-200 border-gray-700">
                            {t('getBack')}
                        </p>
                    </Link>
                </div>
            </div>
        </MainLayout>
    )
}

export default UserAlreadySignedIn
