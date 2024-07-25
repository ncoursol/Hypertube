import Button from '../../components/elems/Button'
import { ErrorField } from '../../components/elems/ErrorFields'
import LinkText from '../../components/elems/LinkText'
import ShowErrorMessage from '../../components/elems/ShowErrorMessage'
import TextPage from '../../components/elems/TextPage'
import TitleSmall from '../../components/elems/TitleSmall'
import MainLayout from '../../layouts/MainLayout'
import { ErMsg } from '../../src/shared/errors'
// import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'
import type { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'
import { useEffect, useState } from 'react'

interface Prop {
    title: string
    textBody: string
}

function PageTitleOneText({ title, textBody }: Prop) {
    const { t } = useTranslation('common')
    return (
        <MainLayout>
            <TitleSmall text={title} />
            <TextPage>
                <p>{textBody}</p>
                <LinkText linkText={t('getBack')} link="/" space="1" />
            </TextPage>
        </MainLayout>
    )
}

function ResetPasswordPage() {
    const router = useRouter()
    const { confirmid } = router.query
    const [retour, setRetour] = useState<string | null>(null)
    const [styleErrorPassword, setStyleErrorPassword] = useState<boolean>(false)
    const [created, setCreated] = useState<boolean>(false)
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const { t } = useTranslation('common')
    let validateCalled = false

    useEffect(() => {
        void validateLink()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [confirmid])

    async function validateLink() {
        if (validateCalled) return
        validateCalled = true
        try {
            const response = await axios.get(
                `http://localhost:5001/web/auth/forgot/${String(confirmid)}`,
                {
                    withCredentials: true,
                },
            )
            if (response.data) setRetour(response.data)
            return response.data
        } catch (errorMsg: any) {
            if (errorMsg.response === 'invalidConfirmId') await router.push('/404')
            setRetour(null)
        }
    }

    async function resetPasswordBackend() {
        try {
            const response = await axios.post(
                `http://localhost:5001/web/auth/forgot/${String(confirmid)}`,
                {
                    password: password,
                },
                {
                    withCredentials: true,
                },
            )
            if (response.data === 'pwdReseted') {
                setError('')
                setStyleErrorPassword(false)
                setCreated(true)
            } else {
                setStyleErrorPassword(true)
                setError(response.data.error)
                setCreated(false)
            }
            return response.data
        } catch (errorMsg: any) {
            setStyleErrorPassword(true)
            if (errorMsg.response) setError(errorMsg.response.data)
            setCreated(false)
        }
    }

    function handleOnChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value)
    }

    function handleSignIn(event: any) {
        void event.preventDefault()
        void resetPasswordBackend()
    }

    let content

    if (retour && retour === 'validConfirmId') {
        if (created) {
            content = (
                <PageTitleOneText title={t('forgot2.pwdChange')} textBody={t('forgot2.newLog')} />
            )
        } else {
            content = (
                <MainLayout>
                    <TitleSmall text={t('forgot2.selectNewPwd')} />
                    <TextPage>
                        <form className="space-y-6" action="#" onSubmit={handleSignIn}>
                            <ShowErrorMessage error={error} message={t('forgot2.noPwdChange')} />
                            <ErrorField
                                name="password"
                                title={t('forgot2.newPwd')}
                                onBlur={handleOnChangePassword}
                                styleError={styleErrorPassword}
                                setStyleError={setStyleErrorPassword}
                                init={password}
                            />

                            <div>
                                <Button
                                    text={t('forgot2.changePwd')}
                                    type="submit"
                                    stylePerso="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                />
                            </div>
                        </form>

                        <LinkText linkText={t('getBack')} link="/" />
                    </TextPage>
                </MainLayout>
            )
        }
    } else {
        content = <PageTitleOneText title={t('forgot2.oups')} textBody={t('forgot2.linkDead')} />
    }

    return content
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return { props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) } }
}

export default ResetPasswordPage
