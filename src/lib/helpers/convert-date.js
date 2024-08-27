const leadingZero = (number) => {
    return number < 10 ? '0' + number : number
}

export const convertDate = (epochTime) => {
    // epochTime = parseInt(epochTime)
    const date = new Date(epochTime)
    const year = date.getFullYear();
    let month = leadingZero(date.getMonth()+1)
    let dt = leadingZero(date.getDate())
    let hours = leadingZero(date.getHours()-2)
    let minutes = leadingZero( date.getMinutes())

    return (dt +'/' + month + '/'+ year + ' - ' + hours + ':' + minutes)
    // return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, hourCycle: 'h23'})
}