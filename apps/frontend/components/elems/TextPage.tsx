import React from 'react'

interface Prop {
    children: any
    center?: boolean
}
function TextPage({ children, center = false }: Prop) {
    const styleType = `text-center mt-10 sm:mx-auto sm:w-full sm:max-w-sm ${
        center && 'text-center'
    }`
    return <div className={styleType}>{children}</div>
}

export default TextPage
