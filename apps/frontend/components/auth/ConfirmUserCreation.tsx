import LinkText from '../elems/LinkText'
import TextPage from '../elems/TextPage'
import TitleSmall from '../elems/TitleSmall'
import TramePage from '../elems/TramePage'
import { useTranslation } from 'next-i18next'

function ConfirmUserCreation() {
    const { t } = useTranslation('common')
    return (
        <TramePage>
            <TitleSmall text={t('ConfirmUserCreation.congrate')} />
            <TextPage>
                <p>{t('ConfirmUserCreation.lastSteps')}</p>
                <LinkText linkText={t('getBack')} link="/" space="1" />
            </TextPage>
        </TramePage>
    )
}

export default ConfirmUserCreation
