import { rebind } from './base.js'
import type { H, HElement, IUpdateContext, J, Selector, Selectors, Children, Func } from './h'
import { HKind } from './h'

const enum NodeType { // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3
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
    for (let p in old)
        if (!(p in now))
            isproperty(e, p, old[p])
                ? e[p] = typeof old[p] === 'boolean' ? false : '' // not sure about this. safest handling of initial values would be to track them. tbd: unit test
                : e.removeAttribute(p)
    for (let p in now)
        isproperty(e, p, now[p])
            ? e[p] = now[p]
            : e.setAttribute(p, now[p])
}

/** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
let syncchildren = (uc: IUpdateContext, p: Element, cn: Children, i: number, ns: string): number => {
    cn.flat().forEach(hc => (i = sync(uc, p, i, hc, ns)))
    return i
}

// tbd: is update in place possible? - add tests for lazy update
function evalprops(p: J | undefined): J | undefined {
    if (!p) return p
    const pr = {} as J
    for (const k in p) {
        let v = p[k]
        pr[k] = v instanceof Function && v.lazy === true ? p[k]() : p[k]
    }
    return pr
}

export const lazy = <T>(expr: Func<T>): T => {
    let e: any = expr
    e.lazy = true // tbd: symbol
    return e // fake alert! in fact we pass the expression through, the framework evaluates the props later lazily
        
} // fake alert! in fact we pass the expression through, the framework evaluates the props later lazily

function sync(uc: IUpdateContext, parent: Element, i: number, h: H | undefined, ns: string): number {

    // console.log('%csync2', "background:orange", parent.tagName, i, h)

    if (h === null || h === undefined) return i // skip. keep 0 and false renderable, per comment below
    let c = parent.childNodes[i]

    switch (h.kind) {
        case HKind.Element:

            let n: Element
            let { tag, cn, p } = h
            cn ??= []

            let pr = evalprops(p)

            if ((<Element>c)?.tagName?.toLowerCase() != tag.toLowerCase()) {
                n = document.createElementNS(ns = pr?.xmlns ?? ns, tag) // replace namespace with propertyvalue if set. otherwise pass forward to children
                c ? c.replaceWith(n) : parent.appendChild(n)
                setprops(n, {}, pr)
                pr?.mounted?.(n)
            } else {
                n = c as Element
                setprops(n, n.h?.p, pr) // tbd: this is wrong - try to break this with property updates, just patch sequences - create an own patch test file
                if (pr?.update?.(c, uc)) return i + 1
            }

            n.h = h

            if (!uc.patchElementOnly && !iswebcomponent(h as HElement)) {
                // tbd: make "island" attribute
                const j = syncchildren(uc, n, cn, 0, ns)
                removeexcesschildren(n, j)
            }

            return i + 1

        case HKind.Fragment:
            return syncchildren(uc, parent, h.cn ?? [], i, ns)

        case HKind.FunctionComponent:
            {
                let hr = h.tag(evalprops(h.p), h.cn)
                let j = sync(uc, parent, i, hr, ns)
                let n = parent.childNodes[i]! // now the dom element exists, unless the function returned undefined or null
                if (n) n.h = h
                return j
            }

        case HKind.ClassComponent:
            {
                let isupdate = (c?.h as any)?.tag == h.tag

                let pr = evalprops(h.p)

                let ci = h.i = isupdate ? h.i! : rebind(new h.tag(pr))
                ci.props = pr // for  the update case we set props

                // if component instance returns truthy for update(), then this update substitutes syncing
                if (isupdate && ci.update?.(uc)) return i + 1

                let hr = ci.view()
                let j = sync(uc, parent, i, hr, ns)
                let n = parent.childNodes[i]!
                if (n) n.h = h // tbd: this could disallow component updates ?? i guess it is right

                ci.element = n
                if (!isupdate) ci?.mounted?.()

                return j
            }

        case undefined:
            // textnode
            let s = h as string // coerce type as the js runtime does
            if (c?.nodeType == NodeType.TextNode) {
                if (c.textContent != s) c.textContent = s // firefox updates equal text, loosing existing text selection
            } else {
                c ? c.replaceWith(s) : parent.append(s)
            }
            return i + 1
    }
}

export function patch(e: Node | null, h: H, uc = {} as IUpdateContext) {
    if (!e) return
    delete uc.patchElementOnly
    if (uc.replace) (e as HTMLElement).replaceChildren()
    const p = e.parentElement as HTMLElement
    const i = [].indexOf.call<any, any, any>(p.childNodes, e)
    // always called deferred, because removing elements can trigger events and their handlers (like blur)
    sync(uc, p, i, h, p.namespaceURI!) // is this safe? use default html namespace?
}

export function updateviewuc(u: IUpdateContext, ...sels: Selectors): void { updateviewinternal(u, ...sels) }
export function updateview(...sels: Selectors): void { updateviewinternal({}, ...sels) }

function updateviewinternal(uc: IUpdateContext, ...sels: Selector[]): void {
    if (!sels.length) sels.push('body')
    sels.flatMap(s => (typeof s == 'string' ? [...document.querySelectorAll(s)] : s ? [s] : []))
        .forEach(e => { patch(e, e.h!, uc) })
}
