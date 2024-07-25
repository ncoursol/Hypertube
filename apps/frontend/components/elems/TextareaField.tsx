import React from 'react'

interface Prop {
    name: string
    title: string
    description?: string
    onBlur: any
    init?: string
}

export function TextareaField({ name, title, description = '', onBlur, init = '' }: Prop) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium leading-6 text-gray-900">
                {title}
            </label>
            <textarea
                id={name}
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={description}
                value={init}
                onBlur={(e) => {
                    onBlur(e)
                }}
                onChange={(e) => onBlur(e)}
            ></textarea>
        </div>
    )
}
