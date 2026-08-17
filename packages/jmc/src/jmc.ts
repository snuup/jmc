import { rebind } from './base.js'
import type { H, HElement, IUpdateContext, J, Selector, Children, HClassComponent } from './h'
import { HKind } from './h'

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
let syncchildren = (uc: IUpdateContext, p: Element, cn: Children, i: number, ns: string): number => {
    cn.flat().forEach(hc => (i = sync(uc, p, i, hc, ns)))
    return i
}

function sync(uc: IUpdateContext, parent: Element, i: number, h: H | undefined, ns: string): number {

    // console.log('%csync2', "background:orange", parent.tagName, i, h)

    if (h === null || h === undefined) return i // skip. keep 0 and false renderable, per comment below
    let c = parent.childNodes[i]

    switch (h.kind) {
        case HKind.Element:
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
                    setprops(n, n.h?.p, p) // tbd: this is wrong - try to break this with property updates, just patch sequences - create an own patch test file
                    if (p?.update?.(c, uc)) return i + 1
                }

                n.h = h // sets the new property values

                if (!uc.patchElementOnly && !iswebcomponent(h as HElement)) {

                    // island attribute
                    if (n.h?.p?.const) return i + 1

                    const j = syncchildren(uc, n, cn, 0, ns)
                    removeexcesschildren(n, j)
                }

                return i + 1
            }

        case HKind.Fragment:
            {
                return syncchildren(uc, parent, h.cn ?? [], i, ns)
            }

        case HKind.FunctionComponent:
            {
                let hr = h.tag(h.p, h.cn)
                let j = sync(uc, parent, i, hr, ns)
                let n = parent.childNodes[i]! // now the dom element exists, unless the function returned undefined or null
                if (n) n.h = h
                return j
            }

        case HKind.ClassComponent: {
            let isupdate = (c?.h as any)?.tag == h.tag

            if (isupdate) {
                let ci = (c!.h as HClassComponent).i!
                ci.props = h.p

                // update() substitutes view/sync when returning truthy
                return (ci.update?.(uc)) ? i + 1 : sync(uc, parent, i, ci.view(), ns)
            }

            let ci = h.i = rebind(new h.tag(h.p))
            let j = sync(uc, parent, i, ci.view(), ns)
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

export function patch(e: Node | null, h?: H, uc = {} as IUpdateContext) {
    if (!e) return
    if (uc.replace) (e as HTMLElement).replaceChildren()
    let p = e.parentElement as HTMLElement
    let i = [].indexOf.call<any, any, any>(p.childNodes, e)
    sync(uc, p, i, h, p.namespaceURI!)
}

export function updateviewuc(u: IUpdateContext, ...sels: Selector[]): void { updateviewinternal(u, ...sels) }
export function updateview(...sels: Selector[]): void { updateviewinternal({}, ...sels) }

function updateviewinternal(uc: IUpdateContext, ...sels: Selector[]): void {
    if (!sels.length) sels.push('body')
    sels.flatMap(s => (typeof s == 'string' ? [...document.querySelectorAll(s)] : s ? [s] : []))
        .forEach(e => { patch(e, e.h, uc) })
}
