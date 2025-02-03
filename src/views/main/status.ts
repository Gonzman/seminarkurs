enum Status {
    HACKED,
    OFFLINE,
    ONLINE,
    START,
}

function getColor(status: Status): string {
    switch (status) {
        case Status.HACKED:
            return 'lightgreen'
        case Status.OFFLINE:
            return 'gray'
        case Status.ONLINE:
            return 'red'
        case Status.START:
            return 'magenta'
        default:
            return 'gray'
    }
}

export { Status, getColor }
