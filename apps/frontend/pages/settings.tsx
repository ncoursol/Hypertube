import UserNotSignedIn from '../components/auth/UserNotSignedIn'
import Button from '../components/elems/Button'
import { ErrorField } from '../components/elems/ErrorFields'
import MultiplesInputOneRow from '../components/elems/MultiplesInputOneRow'
import ShowErrorMessage from '../components/elems/ShowErrorMessage'
import TitleSmall from '../components/elems/TitleSmall'
import ShowImg from '../components/settings/ShowImg'
import MainLayout from '../layouts/MainLayout'
import { useUserContext } from '../src/context/UserContext'
import { TUserContext } from '../src/shared/user'
import axios from 'axios'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { useEffect, useState } from 'react'

function SettingsPage() {
    const [error, setError] = useState<string>('')
    const { user } = useUserContext()
    const { t } = useTranslation('common')

    //fields
    const [email, setEmail] = useState<string>('')
    const [firstname, setFirstname] = useState<string>('')
    const [lastname, setLastname] = useState<string>('')
    const [mainPicture, setMainPicture] = useState<string>('')

    useEffect(() => {
        void getUserInfo()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function getUserInfo() {
        try {
            const response = await axios.get(`http://localhost:5001/web/users/me`, {
                withCredentials: true,
            })
            setUserInfoForForm(response.data)
            return response.data
        } catch (errorMsg: any) {
            if (errorMsg.response) setError(errorMsg.response.data)
        }
    }

    function setUserInfoForForm(userInfo: TUserContext) {
        setEmail(userInfo.email)
        setFirstname(userInfo.firstName)
        setLastname(userInfo.lastName)
        setMainPicture(userInfo.picture)
    }

    async function saveUserInfo() {
        try {
            const response = await axios.post(
                `http://localhost:5001/web/users/updatesettings`,
                {
                    email: email,
                    lastname: lastname,
                    firstname: firstname,
                    language: user ? user.language : 'en',
                },
                {
                    withCredentials: true,
                },
            )
            setError('')
            return response.data
        } catch (errorMsg: any) {
            if (errorMsg.response) setError(errorMsg.response.data)
        }
    }

    function handleOnChangeEmail(e: React.ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value)
    }
    function handleOnChangeFirstname(e: React.ChangeEvent<HTMLInputElement>) {
        setFirstname(e.target.value)
    }
    function handleOnChangeLastname(e: React.ChangeEvent<HTMLInputElement>) {
        setLastname(e.target.value)
    }

    function handleSaveSettings(event: any) {
        event.preventDefault()
        void saveUserInfo()
    }

    return !user ? (
        <UserNotSignedIn />
    ) : (
        <MainLayout>
            <TitleSmall text={t('settingsMsg')} space="1" />

            <div className="px-6 my-5 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-2" action="#" onSubmit={handleSaveSettings}>
                    <ShowErrorMessage error={error} message={t('settings.noSignUp')} />
                    <ErrorField
                        name="email1"
                        type="email"
                        title={t('email')}
                        onBlur={handleOnChangeEmail}
                        init={email}
                    />
                    <MultiplesInputOneRow nbInRow="2">
                        <ErrorField
                            name="firstname"
                            title={t('firstname')}
                            onBlur={handleOnChangeFirstname}
                            init={firstname}
                        />
                        <ErrorField
                            name="lastname"
                            title={t('lastname')}
                            onBlur={handleOnChangeLastname}
                            init={lastname}
                        />
                    </MultiplesInputOneRow>
                    <div className="flex flex-col items-center">
                        <ShowImg
                            picture={mainPicture}
                            setPicture={setMainPicture}
                            setError={setError}
                        />
                    </div>

                    <Button
                        text={t('settings.amend')}
                        type="submit"
                        stylePerso="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    />
                </form>
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

export default SettingsPage
