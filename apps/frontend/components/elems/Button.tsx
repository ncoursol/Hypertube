import React from 'react'

interface Prop {
    disabled?: boolean
    text: string
    stylePerso?: string
    type?: 'button' | 'submit' | 'reset'
    onClick?: (event: React.FormEvent) => void
}

function Button({ disabled = false, text, stylePerso, type, onClick }: Prop) {
    let styleButton = `flex items-center justify-center px-2 mb:px-5 py-2 text-xs transition-colors duration-200 border rounded-lg w-auto bg-zinc-800 text-gray-200 border-gray-700 sm:text-sm ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-500'
    }`
    if (stylePerso) styleButton = stylePerso
    return (
        <button disabled={disabled} onClick={onClick} type={type} className={styleButton}>
            <span>{text}</span>
        </button>
    )
}

export default Button
