enum Status {
    HACKED,
    OFFLINE,
    ONLINE,
    START,
    UNKNOWN,
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
        case Status.UNKNOWN:
            return 'gray'
    }
}

function getStatusString(status: Status): string {
    switch (status) {
        case Status.HACKED:
            return 'Hacked'
        case Status.OFFLINE:
            return 'OFFLINE'
        case Status.ONLINE:
            return 'Online'
        case Status.START:
            return 'Start'
        case Status.UNKNOWN:
            return 'Unbekannt'
    }
}

export { Status, getColor, getStatusString }
