import Link from 'next/link'
import React, { useEffect, useState } from 'react'

interface PropButtonLinkBar {
    text: string
    page: string
    selected: boolean
    block: boolean
    currLink?: string | null
    setCurrLink?: any
}
function ButtonLinkNavBar({ text, page, block, currLink = null, setCurrLink }: PropButtonLinkBar) {
    let styleInit = `text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
        block && 'block'
    }`
    const [style, setStyle] = useState<string>(styleInit)
    useEffect(() => {
        if (currLink && page.match(currLink)) {
            setStyle(
                `bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium ${
                    block && 'block'
                }`,
            )
        } else
            setStyle(
                `text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium`,
            )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currLink])

    function handleChangePage(pageLink: string) {
        // console.log(pageLink)
        setCurrLink(pageLink)
    }

    return (
        <Link href={page}>
            <p className={style} aria-current="page" onClick={() => handleChangePage(page)}>
                {text} {page}
            </p>
        </Link>
    )
}

export default ButtonLinkNavBar
