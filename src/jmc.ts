import type {
    H,
    HElement,
    J,
    Selector,
    Children,
    HClassComponent,
    HU,
} from './h'
import { rebind } from './base.js'

const enum NodeType {
    // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3,
}

declare global {
    interface Node {
        h?: H & { p?: J }
    }
}

let iswebcomponent = (h: HElement) => h.tag.includes('-')

let attributeNames = new Set([
    'selected',
    'viewBox',
    // other HTML attributes where your framework wants attribute semantics
])

const isproperty = (e: Element, name: string, value: any) =>
    !attributeNames.has(name) &&
    (value instanceof Object ||
        value instanceof Function || (
            e.namespaceURI !== 'http://www.w3.org/2000/svg' &&
            name in e &&
            name !== 'style'))

let setprops = (e: Element & J, old: J | undefined, now: J | undefined) => {
    old ??= {}
    now ??= {}

    // removals
    for (let p in old)
        if (!(p in now))
            isproperty(e, p, old[p])
                ? (e[p] = typeof old[p] === 'boolean' ? false : '')
                : e.removeAttribute(p)

    // updates
    for (let p in now) {
        let v = now[p]
        v = v?.thunk ? v() : v

        if (v != old[p]) {
            if (isproperty(e, p, v)) e[p] = v
            else if ((v === false || v == null) && !p.startsWith('aria-')) e.removeAttribute(p)
            else e.setAttribute(p, v)
        }
    }
}

let removeexcesschildren = (n: Element, i: number) => {
    let c: ChildNode
    while ((c = n.childNodes[i])) {
        try {
            c.remove()
        } catch (_) { } // due to blur-event-handlers, this can fail
    }
}

/** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
let syncchildren = (
    p: Element,
    cn: Children,
    i: number,
    depth: number,
    uc: J,
): number => {
    cn.flat(999)
        .filter((hc) => hc !== null && hc !== undefined) // skip. keep 0 and false renderable, per comment below)
        .forEach((hc) => (i = sync(p, i, hc, undefined, depth, uc)))
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
    hfun: H | undefined,
    depth: number,
    uc: J,
): number {
    // console.log('%csync', "background:orange", parent.tagName, i, h, hfun, depth)

    if (h === null || h === undefined) return i // skip. keep 0 and false renderable, per comment below

    let c = parent.childNodes[i]

    switch (h.kind) {
        case 1: {
            // element
            let n: Element
            let { tag, cn, p } = h
            cn ??= []

            let process = () => {
                setprops(n, n.h?.p, p)
                n.h = hfun ?? h // sets the new property values
                if (
                    --depth &&
                    !n.hasAttribute('const') &&
                    !iswebcomponent(h as HElement)
                ) {
                    const j = syncchildren(n, cn, 0, depth, uc)
                    removeexcesschildren(n, j)
                }
            }

            if ((<Element>c)?.tagName?.toLowerCase() != tag.toLowerCase()) {
                let ns =
                    p?.xmlns ??
                    (parent.tagName == 'foreignObject'
                        ? 'http://www.w3.org/1999/xhtml'
                        : parent.namespaceURI)
                n = document.createElementNS(ns, tag)
                c ? c.replaceWith(n) : parent.appendChild(n)
                process()
                p?.mounted?.(n)
            } else {
                n = c as Element
                if (p?.update?.(c, uc)) return i + 1
                process()
            }

            return i + 1
        }

        case 2: {
            // function component
            let hr = h.tag(h.p, h.cn)
            return sync(parent, i, hr, hfun ?? h, depth, uc)
        }

        case 3: {
            // class component
            if ((c?.h as any)?.tag == h.tag) {
                // update
                let ci = (c.h as HClassComponent).i!
                ci.props = c.h!.p = h.p
                c.h!.p = h.p // for repatable update, set attached h.p. alternatively, we could use ci.props in case where h.p is undefined
                // update() substitutes view/sync when returning truthy
                const handled = ci.update?.(uc)
                let hv: HU
                const j = handled
                    ? i + 1
                    : sync(parent, i, (hv = ci.view()), c.h, depth, uc) // hfun because outermost function shall be attached
                if (!handled) assertnonfragment(h, hv, i, j)
                ci.element = parent.childNodes[i]!
                return j
            } else {
                // create
                let ci = (h.i = rebind(new h.tag(h.p)))
                let hv = ci.view()
                let j = sync(parent, i, hv, h, depth, uc)
                assertnonfragment(h, hv, i, j)
                let n = parent.childNodes[i]!
                ci.element = n
                ci.mounted?.()
                return j
            }
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
    uc = {} as J,
): HTMLElement | undefined {
    if (!e) return
    if (depth == 0) {
        ; (e as HTMLElement).replaceChildren()
        depth = 999
    }
    let p = e.parentElement as HTMLElement
    let i = [].indexOf.call<any, any, any>(p.childNodes, e)
    sync(p, i, h, undefined, depth, uc)
    return p.childNodes[i] as HTMLElement
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

    // if (!patchcount) console.warn("updateview did not update anything. cmds=", ...cmds)
}
