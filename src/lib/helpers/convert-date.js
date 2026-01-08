const leadingZero = (number) => {
    return number < 10 ? `0${number}` : number
}

export const convertDate = (epochTime) => {
    const date = new Date(epochTime)
    const year = date.getFullYear();
    const month = leadingZero(date.getMonth() + 1)
    const dt = leadingZero(date.getDate())
    const hours = leadingZero(date.getHours())
    const minutes = leadingZero(date.getMinutes())

    return `${dt}/${month}/${year}  - ${hours}:${minutes}`
}