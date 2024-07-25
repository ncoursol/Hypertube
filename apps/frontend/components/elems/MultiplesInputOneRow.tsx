import React from 'react'

interface Prop {
    children: any
    nbInRow?: string
}

function MultiplesInputOneRow({ children, nbInRow = '2' }: Prop) {
    const styleType = `mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-${nbInRow}`
    return <div className={styleType}>{children}</div>
}

export default MultiplesInputOneRow
