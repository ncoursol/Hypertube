import TextPage from '../../components/elems/TextPage'
import TitleSmall from '../../components/elems/TitleSmall'
import TramePage from '../../components/elems/TramePage'
import { ErMsg } from '../../src/shared/errors'
import axios from 'axios'
import type { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'
import { useEffect, useState } from 'react'

function ConfirmEmailPage() {
    const router = useRouter()
    const { confirmid } = router.query
    const [retour, setRetour] = useState<string | null>(null)
    const { t } = useTranslation('common')
    let validateCalled = false

    useEffect(() => {
        if (confirmid) {
            void validateLink()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [confirmid])

    async function validateLink() {
        if (validateCalled) return
        validateCalled = true
        try {
            const response = await axios.get(
                `http://localhost:5001/web/auth/confirm/${String(confirmid)}`,
                {
                    withCredentials: true,
                },
            )
            setRetour(response.data)
            return response.data
        } catch (error: any) {
            if (error.response) {
                if (error.response.data === 'invalidConfirmId') await router.push('/404')
                setRetour(error.response.data)
            } else setRetour(null)
        }
    }

    return (
        <TramePage>
            {retour && retour === 'mailConfirmed' && (
                <>
                    <TitleSmall text={t('confirm.congrate')} />
                    <TextPage center={true}>{t('confirm.linkLog')}</TextPage>
                </>
            )}
            {retour && retour === 'alreadyValidated' && (
                <>
                    <TitleSmall text={t('confirm.error')} />
                    <TextPage center={true}>{t('confirm.linkVal')}</TextPage>
                </>
            )}
        </TramePage>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return { props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) } }
}

export default ConfirmEmailPage
