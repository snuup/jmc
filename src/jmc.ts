import type { H, HElement, J, Selector, Children, HClassComponent, HU } from './h'
import { rebind } from './base.js'

const enum NodeType { // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3
}

declare global {
    interface Node {
        h?: H & { p?: J }
    }
}

let iswebcomponent = (h: HElement) => h.tag.includes('-')

const isproperty = (e: Element, name: string, value: any) =>
    name !== "viewBox" &&
    (value instanceof Object ||
        value instanceof Function ||
        (e.namespaceURI !== "http://www.w3.org/2000/svg" && name in e && name != 'style'))

let setprops = (e: Element & J, old: J | undefined, now: J | undefined) => {

    old ??= {}
    now ??= {}

    // removals
    for (let p in old)
        if (!(p in now))
            isproperty(e, p, old[p])
                ? e[p] = typeof old[p] === 'boolean' ? false : ''
                : e.removeAttribute(p)
    // updates
    for (let p in now) {
        let v = now[p]
        if (v != old[p]) {
            isproperty(e, p, v)
                ? e[p] = v
                : e.setAttribute(p, v)
        }
    }
}

let removeexcesschildren = (n: Element, i: number) => {
    let c: ChildNode
    while ((c = n.childNodes[i])) {
        try { c.remove() } catch (_) { } // due to blur-event-handlers, this can fail
    }
}

/** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
let syncchildren = (p: Element, cn: Children, i: number, ns: string, depth: number, uc: J): number => {
    cn.flat(999)
        .filter(hc => hc !== null && hc !== undefined) // skip. keep 0 and false renderable, per comment below)
        .forEach(hc => (i = sync(p, i, hc, ns, depth, uc)))
    return i
}

function sync(parent: Element, i: number, h: HU, ns: string, depth: number, uc: J): number {

    // console.log('%csync2', "background:orange", parent.tagName, i, h, depth)

    if (h === null || h === undefined) return i // skip. keep 0 and false renderable, per comment below

    let c = parent.childNodes[i]

    switch (h.kind) {
        case 1:
            {
                let n: Element
                let { tag, cn, p } = h
                cn ??= []

                let processchildren = () => {
                    if (--depth && !n.h?.p?.const && !iswebcomponent(h as HElement)) {
                        const j = syncchildren(n, cn, 0, ns, depth, uc)
                        removeexcesschildren(n, j)
                    }
                }

                if ((<Element>c)?.tagName?.toLowerCase() != tag.toLowerCase()) {
                    n = document.createElementNS(ns = p?.xmlns ?? ns, tag) // replace namespace with propertyvalue if set. otherwise pass forward to children
                    c ? c.replaceWith(n) : parent.appendChild(n)
                    setprops(n, {}, p)
                    n.h = h // sets the new property values
                    processchildren()
                    p?.mounted?.(n)
                } else {
                    n = c as Element
                    setprops(n, n.h?.p, p)
                    n.h = h // sets the new property values
                    processchildren()
                    if (p?.update?.(c, uc)) return i + 1
                }
                
                return i + 1
            }

        case 4:
            {
                return syncchildren(parent, h.cn ?? [], i, ns, --depth, uc)
            }

        case 2:
            {
                let hr = h.tag(h.p, h.cn)
                let j = sync(parent, i, hr, ns, depth, uc)
                let n = parent.childNodes[i]! // now the dom element exists, unless the function returned undefined or null
                if (n) n.h = h
                return j
            }

        case 3: {
            let isupdate = (c?.h as any)?.tag == h.tag

            if (isupdate) {
                let ci = (c!.h as HClassComponent).i!
                ci.props = h.p

                // update() substitutes view/sync when returning truthy
                return (ci.update?.(uc)) ? i + 1 : sync(parent, i, ci.view(), ns, depth, uc)
            }

            let ci = h.i = rebind(new h.tag(h.p))
            let j = sync(parent, i, ci.view(), ns, depth, uc)
            let n = parent.childNodes[i]!
            ci.element = n
            n.h = h
            ci.mounted?.()
            return j
        }

        default:
            // textnode
            let s = h.toString()
            if (c?.nodeType == NodeType.TextNode) {
                if (c.textContent != s) c.textContent = s // firefox updates equal text, loosing existing text selection
            } else {
                c ? c.replaceWith(s) : parent.append(s)
            }
            return i + 1
    }
}

export function patch(e: Node | null, h: H, depth = 999, uc = {} as J) {
    if (!e) return
    if (depth == 0) {
        (e as HTMLElement).replaceChildren()
        depth = 999
    }
    let p = e.parentElement as HTMLElement
    let i = [].indexOf.call<any, any, any>(p.childNodes, e)
    sync(p, i, h, p.namespaceURI!, depth, uc)
}

export type Command = Selector | J | number

export function updateview(...cmds: Command[]): void {

    if (!cmds.length) cmds.push('body')
    let uc = {}
    let depth = 999
    let patchcount = 0

    function f(cmds: Command[]) {
        for (const c of cmds) {
            if (typeof c === 'string') {
                f([...document.querySelectorAll(c)])
            } else if (c instanceof Node) {
                if (c.h) {
                    patch(c, c.h, depth, uc)
                    patchcount++
                }
            } else if (typeof c === 'number') {
                depth = c
            } else {
                uc = c
            }
        }
    }

    f(cmds)

    if (!patchcount) console.warn("updateview did not update anything. cmds=", ...cmds)
}
