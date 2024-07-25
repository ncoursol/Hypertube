import ConfirmMailConfirmationSent from '../components/auth/ConfirmMailRecoverySent'
import UserAlreadySignedIn from '../components/auth/UserAlreadySignedIn'
import Button from '../components/elems/Button'
import { ErrorField } from '../components/elems/ErrorFields'
import LinkText from '../components/elems/LinkText'
import ShowErrorMessage from '../components/elems/ShowErrorMessage'
import TitleSmall from '../components/elems/TitleSmall'
import TramePage from '../components/elems/TramePage'
import { useUserContext } from '../src/context/UserContext'
import { ErMsg } from '../src/shared/errors'
// import { useUserContext } from "../context/UserContext";
import axios from 'axios'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { useEffect, useState } from 'react'

function ForgotPasswordPage() {
    const [email, setEmail] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [styleErrorEmail, setStyleErrorEmail] = useState<boolean>(false)
    const [styleError, setStyleError] = useState<boolean>(false)
    const [created, setCreated] = useState<boolean>(false)
    const { user } = useUserContext()
    const { t } = useTranslation('common')

    useEffect(() => {
        if (!styleError) return
        if (error === '') {
            setStyleErrorEmail(false)
        } else if (error === 'UnknownUsername') {
            //
        }
        setStyleError(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error, styleError])

    function handleOnChangeEmail(e: React.ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value)
    }

    function handleSignIn(event: any) {
        event.preventDefault()
        // console.log('username=' + email );
        void signInBackend()
    }

    async function signInBackend() {
        try {
            const response = await axios.post(
                `http://localhost:5001/web/auth/forgotpwd`,
                {
                    email: email,
                },
                {
                    withCredentials: true,
                },
            )
            // console.log(response.data);
            if (response.data.msg === ErMsg('MSuccessMsg', t)) {
                setError('')
                setStyleError(false)
                setCreated(true)
            }
            return response.data
        } catch (errorMsg: any) {
            if (errorMsg.response) {
                setStyleError(true)
                setError(errorMsg.response.data)
                setCreated(false)
            }
        }
    }

    let content

    if (user) {
        content = <UserAlreadySignedIn />
    } else if (created) {
        content = <ConfirmMailConfirmationSent />
    } else {
        content = (
            <TramePage>
                <TitleSmall text={t('forgot.title')} />
                <div className="px-6 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form
                        className="space-y-6"
                        action="#"
                        onSubmit={(data) => {
                            handleSignIn(data)
                            setCreated(true)
                        }}
                    >
                        <ShowErrorMessage error={error} message={t('forgot.noRecovery')} />
                        <ErrorField
                            name="email1"
                            type="email"
                            title={t('email')}
                            onBlur={handleOnChangeEmail}
                            init={email}
                            styleError={styleErrorEmail}
                            setStyleError={setStyleErrorEmail}
                        />

                        <div>
                            <Button
                                text={t('forgot.recoverPwd')}
                                type="submit"
                                stylePerso="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            />
                        </div>
                    </form>

                    <LinkText firstText={t('NAM')} linkText={t('signUp')} link="/signup" />
                    <LinkText
                        firstText={t('forgot.rememberPwd')}
                        linkText={t('signIn')}
                        link="/signin"
                        space="1"
                    />
                </div>
            </TramePage>
        )
    }

    return content
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    }
}

export default ForgotPasswordPage
