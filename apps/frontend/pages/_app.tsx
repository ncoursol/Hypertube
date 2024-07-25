import { UserProvider } from '../src/context/UserContext'
import '../styles/global.css'
import { NextPage } from 'next'
import { appWithTranslation } from 'next-i18next'
import React from 'react'

interface MyAppProps {
    Component: NextPage
    pageProps: Record<string, any>
}

function MyApp({ Component, pageProps }: MyAppProps) {
    const originalConsoleWarn = console.warn

    console.warn = (...args: any[]) => {
        const message = args[0]
        if (
            !message.includes(
                'react-i18next:: You will need to pass in an i18next instance by using initReactI18next',
            )
        ) {
            originalConsoleWarn(...args)
        }
    }

    return (
        <UserProvider>
            <Component {...pageProps} />
        </UserProvider>
    )
}

export default appWithTranslation(MyApp)
