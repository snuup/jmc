import type {
    H,
    HElement,
    HComp,
    J,
    Selector,
    Children,
    HClassComponent,
    HU,
} from './h.js'
import { rebind } from './base.js'

const enum NodeType {
    // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3,
    Comment = 8,
}

declare global {
    interface Node {
        /** the H this node updates from: the element's own H, or the outermost component rendering it */
        h?: HElement | HComp
        /** props last applied to this element. kept apart from h, which may be the owning component's H */
        ep?: J
    }
}

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
let setprops = (e: Element & J, old: J = {}, now: J): J => {
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

let removeexcesschildren = (n: Element, i: number) => {
    let c: ChildNode
    while ((c = n.childNodes[i])) {
        try {
            c.remove()
        } catch { } // due to blur-event-handlers, this can fail
    }
}

/** synchronizes children starting at the i-th node. returns the index after the last child synchronized */
let syncchildren = (
    p: Element,
    cn: Children,
    i: number,
    depth: number,
    uc: J,
): number => {
    cn.flat(999).forEach((hc) => (i = sync(p, i, hc, undefined, depth, uc)))
    return i
}

/** class components must render exactly one root node, they are attached to it and update through it */
let assertnonfragment = (h: HClassComponent, hv: HU, i: number, j: number) => {
    if (j - i != 1 || hv?.kind == 4) throw new Error(`${h.tag.name}.view() must render exactly one root element`)
}

function sync(
    parent: Element,
    i: number,
    h: HU,
    hfun: HComp | undefined,
    depth: number,
    uc: J,
): number {
    let c = parent.childNodes[i]

    // null, undefined and booleans render nothing, like in React, so {cond && <b />} works. 0 is still rendered.
    // nothing still takes its slot, as a placeholder: so the siblings after it keep their position, and with it their state
    if (h == null || typeof h == 'boolean') {
        if (hfun?.kind != 3) h = '' // an empty text node, invisible
        else {
            // a class component rendering nothing is attached to a comment, so it keeps its state and can show itself again
            if (c?.nodeType != NodeType.Comment) {
                let n = new Comment()
                c ? c.replaceWith(n) : parent.append(n)
                c = n
            }
            c.h = hfun
            return i + 1
        }
    }

    switch (h.kind) {
        case 1: {
            // element
            let n: Element
            let { tag, cn = [], p } = h

            let fresh = (<Element>c)?.tagName?.toLowerCase() != tag.toLowerCase()
            if (fresh) {
                let ns =
                    p.xmlns ??
                    (parent.tagName == 'foreignObject'
                        ? 'http://www.w3.org/1999/xhtml'
                        : parent.namespaceURI)
                n = document.createElementNS(ns, tag)
                c ? c.replaceWith(n) : parent.appendChild(n)
            } else n = c as Element

            n.h = hfun ?? h // attach before update(), which may handle the update itself
            if (jmcconfig.debug && hfun) n.setAttribute('comp', hfun.tag.name)
            if (!fresh && p.update?.(n, uc)) return i + 1

            // a const element is an island: jmc renders it once, then foreign code owns it. update() still runs
            if (fresh || !p.const) {
                n.ep = setprops(n, n.ep, p)
                if (--depth && !tag.includes('-')) { // web components render their own children
                    const j = syncchildren(n, cn, 0, depth, uc)
                    removeexcesschildren(n, j)
                }
            }
            if (fresh) p.mounted?.(n)

            return i + 1
        }

        case 2: {
            // function component
            let hr = h.tag(h.p, h.cn)
            return sync(parent, i, hr, hfun ?? h, depth, uc)
        }

        case 3: {
            // class component. reuses the instance attached to c, if c renders the same class
            let old = c?.h?.tag == h.tag ? c.h as HClassComponent : undefined
            let ci = old ? old.i! : (h.i = rebind(new h.tag(h.p)))
            if (old) {
                ci.props = old.p = h.p // set attached p too, for a repeatable update through c.h
                if (ci.update?.(uc)) return i + 1 // update() substitutes view/sync when returning truthy
            }
            let hv = ci.view()
            let j = sync(parent, i, hv, old ?? h, depth, uc) // the attached H, so updates find the instance
            assertnonfragment(h, hv, i, j)
            ci.element = parent.childNodes[i]
            if (!old) ci.mounted?.()
            return j
        }

        case 4: {
            // fragment. hfun is deliberately not passed on: a component returning a fragment is not attached
            // to any node, so it cannot update itself, only its parent can update it
            return syncchildren(parent, h.cn ?? [], i, --depth, uc)
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

export function patch(
    e: Node | null,
    h: H,
    depth = 999,
    uc: J = {},
): HTMLElement | undefined {
    if (!e) return
    if (depth == 0) {
        (e as Element).replaceChildren()
        depth = 999
    }
    let p = e.parentElement!
    let i = [...p.childNodes].indexOf(e as ChildNode)
    sync(p, i, h, undefined, depth, uc)
    return p.childNodes[i] as HTMLElement
}

export type Command = Selector | J | number

export function updateview(...cmds: Command[]): void {
    if (!cmds.some(c => typeof c == 'string' || c instanceof Node)) cmds.push('body') // no target given: body
    let uc: J = {}
    let depth = 999

    // isConnected: a selector's matches are collected upfront, patching one can replace a later one
    let up = (n: Node) => { if (n.h && n.isConnected) patch(n, n.h, depth, uc) }

    for (const c of cmds)
        if (typeof c == 'string') document.querySelectorAll(c).forEach(up)
        else if (c instanceof Node) up(c)
        else if (typeof c == 'number') depth = c
        else uc = c
}
