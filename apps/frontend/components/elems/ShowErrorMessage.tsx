import { useTranslation } from 'next-i18next'
import React from 'react'

interface Prop {
    error: string
    message: string
}
function ShowErrorMessage({ error, message }: Prop) {
    const { t } = useTranslation('common')
    return error !== '' ? (
        <div className="brightness-100 text-rose-600 hover:brightness-150 border-slate-400 ">
            {message} {t(error)}
        </div>
    ) : (
        <></>
    )
}

export default ShowErrorMessage
