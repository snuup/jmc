// future work: maybe lifecycle callbacks should occur in a phase 2 after a phase 1 that does all dom updates

declare global {
    interface Element {
        eventmap?: { [type: string]: EventListener | null }
    }
}

export function setevent(
    el: Element,
    type: string,
    handler: EventListener | null) {

    let map = el.eventmap ??= {}

    const old = map[type]
    if (old === handler) return
    if (old) el.removeEventListener(type, old)
    if (handler) {
        el.addEventListener(type, handler)
        map[type] = handler
    } else {
        delete map[type]
    }
}