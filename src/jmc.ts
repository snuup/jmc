import type { H, HElement, IUpdateContext, J, Selector, Children, HClassComponent } from './h'
import { rebind } from './base.js'
import { kindcc, kindelement, kindfc, kindfragment } from './h.js'

const enum NodeType { // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3
}

declare global {
    interface Node {
        h?: H & { p?: J }
    }
}

let removeexcesschildren = (n: Element, i: number) => {
    let c: ChildNode
    while ((c = n.childNodes[i])) {
        try { c.remove() } catch (_) { } // due to blur-event-handlers, this can fail
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

/** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
let syncchildren = (p: Element, cn: Children, i: number, ns: string, depth: number): number => {
    cn.flat(999).forEach(hc => (i = sync(p, i, hc, ns, depth)))
    return i
}

function sync(parent: Element, i: number, h: H | undefined, ns: string, depth: number): number {

    console.log('%csync2', "background:orange", parent.tagName, i, h, depth)
    if (!depth) return i + 1

    if (h === null || h === undefined) return i // skip. keep 0 and false renderable, per comment below
    let c = parent.childNodes[i]

    switch (h.kind) {
        case kindelement:
            {
                let n: Element
                let { tag, cn, p } = h
                cn ??= []

                if ((<Element>c)?.tagName?.toLowerCase() != tag.toLowerCase()) {
                    n = document.createElementNS(ns = p?.xmlns ?? ns, tag) // replace namespace with propertyvalue if set. otherwise pass forward to children
                    c ? c.replaceWith(n) : parent.appendChild(n)
                    setprops(n, {}, p)
                    p?.mounted?.(n)
                } else {
                    n = c as Element
                    setprops(n, n.h?.p, p)
                    if (p?.update?.(c, globaluc)) return i + 1
                }

                n.h = h // sets the new property values

                if (!globaluc.patchElementOnly && !iswebcomponent(h as HElement)) {

                    // island attribute
                    if (n.h?.p?.const) return i + 1

                    const j = syncchildren(n, cn, 0, ns, depth)
                    removeexcesschildren(n, j)
                }

                return i + 1
            }

        case kindfragment:
            {
                return syncchildren(parent, h.cn ?? [], i, ns, depth)
            }

        case kindfc:
            {
                let hr = h.tag(h.p, h.cn)
                let j = sync(parent, i, hr, ns, depth)
                let n = parent.childNodes[i]! // now the dom element exists, unless the function returned undefined or null
                if (n) n.h = h
                return j
            }

        case kindcc: {
            let isupdate = (c?.h as any)?.tag == h.tag

            if (isupdate) {
                let ci = (c!.h as HClassComponent).i!
                ci.props = h.p

                // update() substitutes view/sync when returning truthy
                return (ci.update?.(globaluc)) ? i + 1 : sync(parent, i, ci.view(), ns, depth)
            }

            let ci = h.i = rebind(new h.tag(h.p))
            let j = sync(parent, i, ci.view(), ns, depth)
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

let globaluc: IUpdateContext
let updatedepth: number

export function patch(e: Node | null, h?: H) {
    debugger
    if (!e) return
    if (updatedepth == 0) (e as HTMLElement).replaceChildren()
    let p = e.parentElement as HTMLElement
    let i = [].indexOf.call<any, any, any>(p.childNodes, e)
    sync(p, i, h, p.namespaceURI!, updatedepth)
}

export type Command = Selector | IUpdateContext | number

export function updateview(...cmds: Command[]): void {
    if (!cmds.length) cmds.push('body')
    updatedepth = 999
    globaluc = {}
    updateviewinternal(cmds)
}

export function updateviewinternal(cmds: Command[]): void {

    for (const c of cmds) {
        if (typeof c === 'string') {
            updateviewinternal([...document.querySelectorAll(c)])
        } else if (c instanceof Node) {
            patch(c, c.h)
        } else if (typeof c === 'number') {
            updatedepth = c
        } else {
            globaluc = c
            if (c.replace) updatedepth = 0
            if (c.patchElementOnly) updatedepth = 1
        }
    }
}
