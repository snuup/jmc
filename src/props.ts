import type { J } from './h.js'

/** settings to tweak jmc */
export const jmcconfig = {
    /** marks component roots with a comp="Name" attribute */
    debug: false,
    /** prop names always set as attributes, never as properties */
    attributes: new Set(['selected', 'viewBox']),
}

const isproperty = (e: Element, name: string, value: any) =>
    !jmcconfig.attributes.has(name) &&
    (value instanceof Object || ( // objects and functions
        e.namespaceURI !== 'http://www.w3.org/2000/svg' &&
        name in e &&
        name !== 'style'))

let removeprop = (e: Element & J, p: string, old: any) => {
    if (isproperty(e, p, old)) e[p] = typeof old === 'boolean' ? false : ''
    if (!(old instanceof Object)) e.removeAttribute(p) // reflected properties (title, id, ...) leave an empty attribute otherwise
}

/** applies now over old and returns the applied values, with thunks evaluated, to serve as old on the next call */
export let setprops = (e: Element & J, old: J = {}, now: J): J => {
    // evaluate thunks into a copy: now is h.p, which gets rendered again and must keep its thunks
    now = Object.fromEntries(Object.entries(now).map(([k, v]) => [k, v?.thunk ? v() : v]))

    // removals
    for (let p in old)
        if (!(p in now)) removeprop(e, p, old[p])

    // updates
    for (let p in now) {
        let v = now[p]
        if (v !== old[p] && !(v == null && old[p] == null)) { // strict: 0 vs '' or 1 vs true are changes. null vs undefined is not
            if (v == null) removeprop(e, p, old[p])
            else if (isproperty(e, p, v)) e[p] = v
            else if (v === false && !p.startsWith('aria-')) e.removeAttribute(p) // aria-*="false" is meaningful
            else e.setAttribute(p, v)
        }
    }
    return now
}
