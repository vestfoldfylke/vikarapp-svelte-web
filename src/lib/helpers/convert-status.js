export const convertStatus = (status) => {
    switch (status) {
        case 'pending':
            return 'Behandler'
        case 'active':
            return 'Aktiv'
        case 'expired':
            return 'Utgått'
        default:
            return status
    }
}