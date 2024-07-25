import { useUserContext } from '../../src/context/UserContext'
import axios from 'axios'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

const LanguageSelector: React.FC = () => {
    const router = useRouter()
    const { i18n } = useTranslation()

    const { user, updateUser } = useUserContext()

    async function amendLanguage(newLocale: string) {
        //console.log('amending language from ' + user?.language + ' to ' + newLocale)
        try {
            if (newLocale && (newLocale === 'en' || newLocale === 'fr')) {
                if (user) {
                    const response = await axios.post(
                        `http://localhost:5001/web/users/updatesettings`,
                        {
                            email: user.email,
                            lastname: user.lastName,
                            firstname: user.firstName,
                            language: newLocale,
                        },
                        {
                            withCredentials: true,
                        },
                    )
                    // console.log(response.data)
                    updateUser({ language: newLocale })
                }
            }
        } catch {
            // console.log(response.data)
        }
    }

    async function changeLanguage(newLocale: string) {
        const { pathname, asPath, query } = router

        await amendLanguage(newLocale)

        await router.push({ pathname, query }, asPath, { locale: newLocale })
    }

    useEffect(() => {
        const userLanguage = user ? user.language : null
        const initialLanguage = userLanguage || router.locale || router.defaultLocale || 'en'
        void i18n.changeLanguage(initialLanguage)

        // const { pathname, asPath, query } = router
        // router.push({ pathname, query }, asPath, { locale: initialLanguage })
    }, [])

    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'Français' },
    ]
    return (
        <div>
            <select
                className="uppercase px-2 ml-3 py-2 text-xs transition-colors duration-200 border rounded-lg w-auto bg-gray-900 text-gray-200 border-gray-700 sm:text-sm"
                onChange={(e) => changeLanguage(e.target.value)}
                value={i18n.language}
            >
                {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.value}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default LanguageSelector
