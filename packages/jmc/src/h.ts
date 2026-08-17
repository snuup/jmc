export type J = Record<string, any> // a json record

// Overload signatures
export type Selector = string | Node | undefined | null

export type FComponent = (props: J | undefined, children?: Children) => HElement // show an example for usage of children
export type FComponentT<P> = (pcn: P, cn?: Children) => H | void

export interface IClassComponent {
    element: Node
    props?: Record<string, any>
    view(): H
    update(uc: IUpdateContext): boolean | void
    mounted?(): void
}

export interface CComponent {
    new(props: any): IClassComponent
}

export type Children = (H | undefined)[]

export type HText =
    | string // text node
    | number // text node
    | boolean // do not allow boolean, that

export type HFragment = {
    kind: HKind.Fragment
    cn?: Children
}

export type HElement = {
    kind: HKind.Element
    tag: string
    p?: J
    cn?: Children
}

export type HFunctionComponent = {
    kind: HKind.FunctionComponent
    tag: FComponent
    p?: J
    cn?: Children
}

export type HClassComponent = {
    kind: HKind.ClassComponent
    tag: CComponent
    p?: J
    cn?: Children
    i?: IClassComponent
}

export const enum HKind {
    Element = 1,
    FunctionComponent = 2,
    ClassComponent = 3,
    Fragment = 4
}

export type HComp = HFunctionComponent | HClassComponent

export type H =
    | HText & { kind?: undefined } // text nodes never have a kind. but this type addition makes H a full DU
    | HElement
    | HFunctionComponent
    | HClassComponent
    | HFragment

export interface IUpdateContext {
    patchElementOnly?: boolean
    replace?: boolean
}



let isclass = (f: Function) => /^class\s|^class\{/.test(f.toString())

export function jsx(tag: any, p: any, ...cn: any[]): HElement | HFunctionComponent | HClassComponent | HFragment {
    if (tag?.kind) return tag // already an H node, flatten tree

    let kind = tag == jsxf ? HKind.Fragment
        : tag instanceof Function ? (isclass(tag) ? HKind.ClassComponent : HKind.FunctionComponent)
        : HKind.Element

    let h: any = { kind }
    if (kind != HKind.Fragment) h.tag = tag
    if (p) h.p = p
    if (cn?.length) h.cn = cn
    return h
}

// fragment is only used above as a sentinel
export let jsxf = Symbol()