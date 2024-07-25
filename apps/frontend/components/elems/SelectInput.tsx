import React from 'react'

interface Prop {
    title: string
    name?: string
    list: string[]
    onBlur: any
    init?: string
    size?: number
}

function SelectInput({ title, name = 'default', list, onBlur, init, size }: Prop) {
    // const styleSelect: string = `block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900
    // shadow-sm ring-1 ring-inset  placeholder:text-gray-400 focus:ring-2 sm:text-sm sm:leading-6
    //  focus:ring-inset focus:ring-indigo-600 ring-gray-300`

    const styleSelect = `bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ${
        size ? 'w-' + size : 'w-full'
    } p-2.5`
    return (
        <>
            <label htmlFor={name} className="block text-sm font-medium leading-6 text-gray-900">
                {title}
            </label>
            <select
                id={name}
                className={styleSelect}
                onBlur={(e) => {
                    onBlur(e)
                }}
                onChange={(e) => onBlur(e)}
                value={init}
            >
                {list.map((elem) => (
                    <option value={elem} key={elem}>
                        {elem}
                    </option>
                ))}
            </select>
        </>
    )
}

export default SelectInput
