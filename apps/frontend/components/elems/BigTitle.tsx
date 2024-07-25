import React from 'react'

interface Prop {
    text: string
    space?: string
}

function TitleBig({ text, space = '10' }: Prop) {
    const styleTitle = `mt-${space} text-center text-4xl font-bold leading-9 tracking-tight text-gray-900`
    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className={styleTitle}>{text}</h2>
        </div>
    )
}

export default TitleBig
