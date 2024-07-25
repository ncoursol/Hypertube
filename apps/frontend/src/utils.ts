export const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}`
}

export const range = (start: number, end: number): number[] => {
    const res = []
    const inc = Math.sign(end - start)
    for (let val = start; val !== end; val += inc) res.push(val)
    res.push(end)
    return res
}
