export function compute18Y(): string {
    const today = new Date()
    const day = `${today.getDate() < 9 ? '0' : ''}${today.getDate()}`
    const month = `${today.getMonth() + 1 < 9 ? '0' : ''}${today.getMonth() + 1}`
    const dateString = `${today.getFullYear() - 17}-${month}-${day}`
    return dateString
}

export function formatDateYYYYMMDD(dateIn: Date): string {
    const dateObj = new Date(dateIn)
    const day = `${dateObj.getDate() <= 9 ? '0' : ''}${dateObj.getDate()}`
    const month = `${dateObj.getMonth() + 1 <= 9 ? '0' : ''}${dateObj.getMonth() + 1}`
    const dateString = `${dateObj.getFullYear()}-${month}-${day}`
    return dateString
}
