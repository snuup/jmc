import { closestby, rebind } from './base'
import { Expr, H, HComp, HClassComponent, HFunctionComponent, HElement, HFragment, HKind, IUpdateContext, J, Props, Selector, Selectors, HText, Children, HEFCR } from './h'

const enum NodeType { // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3,
}

let removeexcesschildren = (n: Element, i: number) => {
    let c: ChildNode
    while ((c = n.childNodes[i])) {
        try { c.remove() } catch (_) { } // due to blur-event-handlers, this can fail
    }
}
let evaluate = <T>(expr: Expr<T>): T => (expr instanceof Function ? expr() : expr)
let iswebcomponent = (h: HElement) => (h.tag as string).includes('-')
let isclasscomponent = (h: HComp): h is HClassComponent => (h.tag as any)?.prototype?.view
let isobject = (o: any): o is object => typeof o === 'object'

let isproperty = (e: Element, name: string, value: any) =>
    name in e ||
    value instanceof Object ||
    value instanceof Function

let setprops = (e: Element, newprops: Props = {}) => {

    let oldprops = e.p // if e is a dom element that was never jmc-d then it has no h attached

    for (let p in oldprops)
        if (!(p in newprops))
            isproperty(e, p, oldprops[p])
                ? (e as J)[p] = typeof oldprops[p] === 'boolean' ? false : ''
                : e.removeAttribute(p)

    for (let p in newprops)
        isproperty(e, p, newprops[p])
            ? (e as J)[p] = newprops[p]
            : e.setAttribute(p, newprops[p])

    e.p = newprops
}

//let istext = (h: H) : h is HText => !("kind" in (h as any))

function sync(uc: IUpdateContext, parent: Element, i: number, he: Expr<H> | undefined, ns?: string): number {

    console.log('%csync2', "background:orange", parent.tagName, i, he, ns)

    /** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
    function syncchildren(p: Element, cn: Children, i: number, ns: string | undefined): number {
        cn.flat().forEach(hc => (i = sync(uc, p, i, hc, ns)))
        return i
    }

    if (he === null || he === undefined) return i // skip this element. not that !!h would forbid to render the number 0 or the boolean value false

    let c = parent.childNodes[i] // is often null, eg during fresh creation

    let h = evaluate(he)

    if (isobject(h)) {

        switch (h.kind) {
            case HKind.Element:

                let n: Element
                let { tag, p, cn } = h
                p ??= {} // simplifies processing, if p is null, need to process like having no props and attach {} to n
                cn ??= []

                if ((<Element>c)?.tagName?.toLowerCase() != tag.toLowerCase()) {
                    ns = p.xmlns ?? ns
                    n = ns ? document.createElementNS(ns, tag) : document.createElement(tag)
                    c ? c.replaceWith(n) : parent.appendChild(n)
                    setprops(n, p)
                    p?.mounted?.(n)
                } else {
                    n = c as Element
                    setprops(n, p)
                    if (p?.update?.(c, uc)) return i + 1
                }

                n.h = he as any // need to attach this to *every* node for property update.

                if (!uc.patchElementOnly && !iswebcomponent(h as HElement)) {
                    // tbd: make "island" attribute
                    const j = syncchildren(n, cn, 0, ns)
                    removeexcesschildren(n, j)
                }

                return i + 1

            case HKind.Fragment:
                return syncchildren(parent, h.cn ?? [], i, ns)

            case HKind.FunctionComponent:
                {
                    let { tag, p, cn } = h
                    p ??= {} // simplifies processing, if p is null, need to process like having no props and attach {} to n
                    cn ??= []

                    let hr = tag(h.p, h.cn)

                    let j = sync(uc, parent, i, hr, ns)

                    let n = parent.childNodes[i]! // now the dom element exists

                    // tbd:
                    // if (n && h.tag as any != jsxf) cn.h = he

                    if (n) n.h = he

                    return j
                }

            case HKind.ClassComponent:
                {
                    let isupdate = c?.h == h

                    let { tag, p, cn } = h
                    p ??= {} // simplifies processing, if p is null, need to process like having no props and attach {} to n
                    cn ??= []

                    h.i = isupdate ? h.i! : rebind(new tag(h.p))
                    h.i.props = h.p // for  the update case we set props

                    // if component instance returns truthy for update(), then this update substitutes syncing
                    if (isupdate && h.i.update(uc)) return i + 1

                    let hr = h.i.view()

                    let j = sync(uc, parent, i, hr, ns)

                    let n = parent.childNodes[i]!
                    if (n) n.h = he

                    h.i.element = n
                    if (!isupdate) h.i?.mounted?.()

                    return j
                }
        }


    } else {
        // textnode
        let s = h as string // coerce type as the js runtime does
        if (c?.nodeType == NodeType.TextNode) {
            if (c.textContent != s) c.textContent = s // firefox updates equal text, loosing existing text selection
        } else {
            c ? c.replaceWith(s) : parent.append(s)
        }
        return i + 1
    }

    return 0
}

/** syncs at position i of p. returns the number of the element past the last added element.
 * if no element was added (eg when h=null) then it returns i
 * if a fragment with 5 nodes was added, it returns i + 5
 * when a single element or component is added, it is i+1 since they always create exactly 1 node
 */
function syncold(p: Element, i: number, he: Expr<H> | undefined, ns?: string): number {
    console.log('%csync', "background:orange", p.tagName, i, he, ns)

    if (he === null || he === undefined) return i // skip this element. not that !!h would forbid to render the number 0 or the boolean value false

    let c = p.childNodes[i] // is often null, eg during fresh creation

    let h = evaluate(he)

    // element node
    if (isobject(h)) {

        if (isfragment(h)) return syncchildren(p, h, i, ns)

        const props = h.p // tbd - check after simplification

        if (iselement(h)) {
            let n: Element

            if ((<Element>c)?.tagName?.toLowerCase() != h.tag.toLowerCase()) {
                ns = props.xmlns ?? ns
                n = ns ? document.createElementNS(ns, h.tag) : document.createElement(h.tag)
                c ? c.replaceWith(n) : p.appendChild(n)
                setprops(n, props)
                props?.mounted?.(n)
            } else {
                n = c as Element
                setprops(n, props)
                if (props?.update?.(c, uc)) return i + 1
            }

            n.h = he as any // need to attach this to *every* node for property update.

            if (!uc.patchElementOnly && !iswebcomponent(h as HElement)) {
                // tbd: make "island" attribute
                const j = syncchildren(n, h, 0, ns)
                removeexcesschildren(n, j)
            }

            return i + 1
        }

        switch (typeof h.tag) {
            case 'function':

                let isupdate = c?.h?.tag == h.tag

                // expand classcomp / functioncomp / fragment
                let hr: H

                if (isclasscomponent(h)) {
                    // class component
                    h.i = isupdate ? h.i : rebind(new h.tag(props))
                    h.i.props = props // for  the update case we set props

                    // if component instance returns truthy for update(), then this update substitutes syncing
                    if (isupdate && h.i.update(uc)) return i + 1

                    hr = h.i.view()
                }
                else {
                    // function component or fragment
                    hr = h.tag(props, h.cn)
                }

                let j = sync(p, i, hr, ns)
                let cn = p.childNodes[i]! // now the dom element exists

                if (cn && !isfragmentfunction(h)) cn.h = he as Expr<HElement | HCompFun | HCompClass> // attach h onto the materialized component node
                //    ; (cn as HTMLElement).setAttribute?.('comp', '')

                if (isclasscomponent(h)) {
                    h.i.element = cn
                    if (!isupdate) h.i?.mounted?.()
                }

                return j

            case 'object':
                return sync(p, i, h.tag, ns) // fragments cause nested vnodes

            default:
                throw '1' // unexpected tag
        }
    } else {
        // textnode
        let s = h as string // coerce type as the js runtime does
        if (c?.nodeType == NodeType.TextNode) {
            if (c.textContent != s) c.textContent = s // firefox updates equal text, loosing existing text selection
        } else {
            c ? c.replaceWith(s) : p.append(s)
        }
        return i + 1
    }
}


let uc: IUpdateContext = {}

export function patch(e: Node | null, h: Expr<H>, uc = {} as IUpdateContext) {
    if (!e) return
    delete uc.patchElementOnly
    if (uc.replace) (e as HTMLElement).replaceChildren()
    const p = e.parentElement as HTMLElement
    const i = [].indexOf.call<any, any, any>(p.childNodes, e)
    // always called deferred, because removing elements can trigger events and their handlers (like blur)
    sync(uc, p, i, h)
}

export function updateviewuc(u: IUpdateContext, ...sels: Selectors): void { updateviewinternal(u, ...sels) }
export function updateview(...sels: Selectors): void { updateviewinternal({}, ...sels) }

function updateviewinternal(uc: IUpdateContext, ...sels: Selector[]): void {
    if (!sels.length) sels.push('body')
    sels.flatMap(s => (typeof s == 'string' ? [...document.querySelectorAll(s)] : s ? [s] : []))
        .forEach(e => { patch(e, e.h!, uc) })
}
