import React from 'react'

interface Prop {
    name: string
    title: string
    onBlur: any
    styleError?: boolean
    setStyleError?: any
    init?: string
    disabled?: boolean
    size?: number
    type?: string
    min?: number | string
    max?: number | string
}

export function ErrorField({
    name,
    title,
    onBlur,
    styleError = false,
    setStyleError = false,
    init = '',
    disabled = false,
    size,
    type = name,
    min = '',
    max = '',
}: Prop) {
    const style = `block ${
        size ? 'w-' + size : 'w-full'
    } rounded-md border-0 py-1.5 pl-2 text-gray-900
	 shadow-sm ring-1 ring-inset  placeholder:text-gray-400 focus:ring-2 sm:text-sm sm:leading-6
	  ${
          styleError
              ? `border-2 border-rose-600`
              : `focus:ring-inset focus:ring-indigo-600 ring-gray-300`
      }
	  ${disabled && 'bg-gray-300'}`
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium leading-6 text-gray-900">
                {title}
            </label>
            <div className="mt-1">
                <input
                    id={name}
                    name={name}
                    type={type}
                    disabled={disabled}
                    required
                    className={style}
                    value={init}
                    min={min}
                    max={max}
                    onBlur={(e) => {
                        onBlur(e)
                        if (setStyleError !== false) setStyleError(false)
                    }}
                    onChange={(e) => onBlur(e)}
                />
            </div>
        </div>
    )
}
