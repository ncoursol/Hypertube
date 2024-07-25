import ConfirmUserCreation from '../components/auth/ConfirmUserCreation'
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
import React from 'react'
import { useEffect, useState } from 'react'

function SignUpPage() {
    const [username, setUsername] = useState<string>('')
    const [password, setpassword] = useState<string>('')
    const [email, setemail] = useState<string>('')
    const [firstname, setfirstname] = useState<string>('')
    const [lastname, setlastname] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [styleErrorUsername, setStyleErrorUsername] = useState<boolean>(false)
    const [styleErrorPwd, setStyleErrorPwd] = useState<boolean>(false)
    const [styleErrorEmail, setStyleErrorEmail] = useState<boolean>(false)
    const [styleErrorFirstname, setStyleErrorFirstname] = useState<boolean>(false)
    const [styleErrorLastname, setStyleErrorLastname] = useState<boolean>(false)
    const [styleError, setStyleError] = useState<boolean>(false)
    const { user } = useUserContext()
    const [created, setCreated] = useState<boolean>(false)
    const { t } = useTranslation('common')

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function setFalseAll() {
        setStyleErrorUsername(false)
        setStyleErrorPwd(false)
        setStyleErrorEmail(false)
        setStyleErrorFirstname(false)
        setStyleErrorLastname(false)
    }

    useEffect(() => {
        if (!styleError) return
        if (error === '') setFalseAll()
        else {
            setFalseAll()
            if (
                error === ErMsg('InvalidUsername', t) ||
                error === ErMsg('MissingUsername', t) ||
                error === ErMsg('UsernameTaken', t)
            )
                setStyleErrorUsername(true)
            else if (error === ErMsg('MissingPwd', t)) setStyleErrorPwd(true)
            else if (error === ErMsg('EmailTaken', t) || error === ErMsg('InvalidEmail', t))
                setStyleErrorEmail(true)
            else if (
                error === ErMsg('InvalidFirstName', t) ||
                error === ErMsg('MissingFirstName', t)
            )
                setStyleErrorFirstname(true)
            else if (error === ErMsg('InvalidLastName', t) || error === ErMsg('MissingLastName', t))
                setStyleErrorLastname(true)
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
    function handleOnChangeEmail(e: React.ChangeEvent<HTMLInputElement>) {
        setemail(e.target.value)
    }
    function handleOnChangeFirstname(e: React.ChangeEvent<HTMLInputElement>) {
        setfirstname(e.target.value)
    }
    function handleOnChangeLastname(e: React.ChangeEvent<HTMLInputElement>) {
        setlastname(e.target.value)
    }

    function handleSignUp(event: any) {
        event.preventDefault()
        void signUpBackend()
    }

    async function signUpBackend() {
        try {
            const response = await axios.post(
                `http://localhost:5001/web/auth/register`,
                {
                    username: username,
                    password: password,
                    email: email,
                    lastName: lastname,
                    firstName: firstname,
                },
                {
                    withCredentials: true,
                },
            )
            // console.log(response.data)
            setError('')
            setStyleError(false)
            setCreated(true)
            return response.data
        } catch (errorMsg: any) {
            // console.log(error)
            setStyleError(true)
            setError(errorMsg?.response?.data ?? 'Failed to sign up')
            //to handle ?
        }
    }

    let content

    if (user) {
        content = <UserAlreadySignedIn />
    } else if (created) {
        content = <ConfirmUserCreation />
    } else {
        content = (
            <MainLayout>
                <TitleSmall text={t('signup.member')} space="1" />

                <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-2" action="#" onSubmit={handleSignUp}>
                        <ShowErrorMessage error={error} message={t('signup.signUpError')} />
                        <ErrorField
                            name="username"
                            title={t('username')}
                            onBlur={handleOnChangeUsername}
                            styleError={styleErrorUsername}
                            setStyleError={setStyleErrorUsername}
                            init={username}
                        />
                        <ErrorField
                            name="email"
                            title={t('email')}
                            onBlur={handleOnChangeEmail}
                            styleError={styleErrorEmail}
                            setStyleError={setStyleErrorEmail}
                            init={email}
                        />
                        <ErrorField
                            name="password"
                            title={t('password')}
                            onBlur={handleOnChangePassword}
                            styleError={styleErrorPwd}
                            setStyleError={setStyleErrorPwd}
                            init={password}
                        />
                        <ErrorField
                            name="firstname"
                            title={t('firstname')}
                            onBlur={handleOnChangeFirstname}
                            styleError={styleErrorFirstname}
                            setStyleError={setStyleErrorFirstname}
                            init={firstname}
                        />
                        <ErrorField
                            name="lastname"
                            title={t('lastname')}
                            onBlur={handleOnChangeLastname}
                            styleError={styleErrorLastname}
                            setStyleError={setStyleErrorLastname}
                            init={lastname}
                        />

                        <div className="pt-5">
                            <Button
                                text={t('signUp')}
                                type="submit"
                                stylePerso="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            />
                        </div>
                    </form>

                    <LinkText firstText={t('signup.AAM')} linkText={t('signIn')} link="/signin" />
                </div>
            </MainLayout>
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

export default SignUpPage
