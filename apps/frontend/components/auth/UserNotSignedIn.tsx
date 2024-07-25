import LinkText from '../elems/LinkText'
import TextPage from '../elems/TextPage'
import TitleSmall from '../elems/TitleSmall'
import TramePage from '../elems/TramePage'
import { useTranslation } from 'next-i18next'
import React from 'react'

function UserNotSignedIn() {
    const { t } = useTranslation('common')
    return (
        <TramePage>
            <TitleSmall text={t('UserNotSignedIn.getOut')} />
            <TextPage>
                <p>{t('UserNotSignedIn.plsSign')}</p>
                <LinkText linkText={t('signIn')} link="/signin" space="1" />
            </TextPage>
        </TramePage>
    )
}

export default UserNotSignedIn
