import UserAlreadySignedIn from '../components/auth/UserAlreadySignedIn'
import Button from '../components/elems/Button'
import { ErrorField } from '../components/elems/ErrorFields'
import LinkText from '../components/elems/LinkText'
import ShowErrorMessage from '../components/elems/ShowErrorMessage'
import TitleSmall from '../components/elems/TitleSmall'
import MainLayout from '../layouts/MainLayout'
import { useUserContext } from '../src/context/UserContext'
import { ErMsg } from '../src/shared/errors'
import axios from 'axios'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'
import { useEffect, useState } from 'react'

function SignInPage() {
    const [username, setUsername] = useState<string>('')
    const [password, setpassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [styleErrorUsername, setStyleErrorUsername] = useState<boolean>(false)
    const [styleErrorPwd, setStyleErrorPwd] = useState<boolean>(false)
    const [styleError, setStyleError] = useState<boolean>(false)
    const router = useRouter()
    const { user, loginUser } = useUserContext()
    const { t } = useTranslation('common')

    useEffect(() => {
        // if (user) router.push('/')
    }, [user])

    useEffect(() => {
        if (!styleError) return
        if (error === '' || error === ErMsg('EmailNotVerified', t)) {
            setStyleErrorUsername(false)
            setStyleErrorPwd(false)
        } else if (error === ErMsg('UnknownUsername', t)) {
            setStyleErrorUsername(true)
            setStyleErrorPwd(true)
        } else if (error === ErMsg('InvalidPassword', t)) {
            setStyleErrorUsername(false)
            setStyleErrorPwd(true)
        }
        setStyleError(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error, styleError])

    function handleOnChangeUsername(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value)
    }
    function handleOnChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
        setpassword(e.target.value)
    }

    function handleSignIn(event: any) {
        event.preventDefault()
        void signInBackend()
    }

    async function signInBackend() {
        try {
            const response = await axios.post(
                `http://localhost:5001/web/auth/login`,
                { username, password },
                { withCredentials: true },
            )
            if (response.data) {
                if (response.data === 'emailNotVerified') {
                    setError(t('emailNotVerified'))
                    return
                }
                loginUser(response.data)
                setError('')
                setStyleError(false)
                void router.push('/')
            }
            return response.data
        } catch (err: any) {
            setStyleError(true)
            if (error && err.response && err.response.data) setError(err.response.data)
            loginUser(null)
        }
    }

    return user ? (
        <UserAlreadySignedIn />
    ) : (
        <MainLayout>
            <TitleSmall text={t('signin.signinTitle')} />
            <div className="px-6 my-5 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" action="#" onSubmit={handleSignIn}>
                    <ShowErrorMessage error={error} message={''} />
                    <ErrorField
                        name="username"
                        title={t('username')}
                        onBlur={handleOnChangeUsername}
                        styleError={styleErrorUsername}
                        setStyleError={setStyleErrorUsername}
                        init={username}
                    />
                    <ErrorField
                        name="password"
                        title={t('password')}
                        onBlur={handleOnChangePassword}
                        styleError={styleErrorPwd}
                        setStyleError={setStyleErrorPwd}
                        init={password}
                    />

                    <div>
                        <Button
                            text={t('signIn')}
                            type="submit"
                            stylePerso="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        />
                    </div>
                </form>
                <div className="inline-flex items-center justify-center w-full">
                    <hr className="w-64 h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                    <span className="absolute px-3 -translate-x-1/2 bg-white left-1/2">
                        {t('or')}
                    </span>
                </div>
                <div className="flex flex-col">
                    <button
                        type="button"
                        className="text-white bg-[#000000] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 me-2 mb-2"
                    >
                        <svg
                            className="w-5 h-4 me-2"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 13"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.8 0 0 7.15 0 9.75 7.8 9.75 7.8 13 11.05 13 11.05 7.15 3.25 7.15 11.05 0Z"
                                clipRule="evenodd"
                            ></path>
                            <path
                                fillRule="evenodd"
                                d="M16.25 3.25 16.25 0 13 3.25 13 0 19.5 0 19.5 3.25 16.25 7.8 16.25 11.05 19.5 7.8 19.5 11.05 13 11.05 13 7.8Z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                        <a
                            href="https://api.intra.42.fr/oauth/authorize?client_id=88ebd807f809ddd25f6b6aa15d8f0e5a08ea725b5bf5fc80143c9e225f6b5ecc&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin%2F42&response_type=code"
                            className="w-full text-center"
                        >
                            {t('signin.log42')}
                        </a>
                    </button>
                    <button
                        type="button"
                        className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 me-2 mb-2"
                    >
                        <svg
                            className="w-4 h-4 me-2"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <a
                            href="https://github.com/login/oauth/authorize?client_id=a8047e3e2d61515e6d2d&redirect_uri=http://localhost:3000/login%2Fgithub&scope=read:user"
                            className="w-full text-center"
                        >
                            {t('signin.logGit')}
                        </a>
                    </button>
                    <button
                        type="button"
                        className="text-white bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 me-2 mb-2"
                    >
                        <svg
                            className="w-4 h-4 me-2"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 8 19"
                        >
                            <path
                                fillRule="evenodd"
                                d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <a
                            href="https://www.facebook.com/v18.0/dialog/oauth?client_id=2811827598960107&redirect_uri=http://localhost:3000/login%2Ffacebook&state=1234567890&scope=email"
                            className="w-full text-center"
                        >
                            {t('signin.logFb')}
                        </a>
                    </button>
                </div>

                <LinkText firstText={t('NAM')} linkText={t('signUp')} link="/signup" />
                <LinkText
                    firstText={t('signin.forgot')}
                    linkText={t('signin.reset')}
                    link="/forgot"
                    space="1"
                />
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

export default SignInPage
