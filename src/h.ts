export type J = Record<string, any> // a json record

// Overload signatures
export type Selector = string | Node

export type FComponent = (props: J | undefined, children?: Children) => HU
export type FComponentT<P> = (pcn: P, cn?: Children) => HU

type HKindElement = 1
type HKindFunctionComponent = 2
type HKindClassComponent = 3
type HKindFragment = 4

// export const kindelement : HKindElement = 1
// export const kindfc : HKindFunctionComponent = 2
// export const kindcc : HKindClassComponent = 3
// export const kindfragment : HKindFragment = 4

export type HKind = HKindElement | HKindFunctionComponent | HKindClassComponent | HKindFragment

export interface IClassComponent {
    element: Node
    props?: Record<string, any>
    view(): HU
    update(uc: any): boolean | void
    mounted?(): void
}

export interface CComponent {
    new(props: any): IClassComponent
}

export type Children = HU[]

export type HText =
    | string // text node
    | number // text node
    | boolean // do not allow boolean, that

export type HFragment = {
    kind: HKindFragment
    cn?: Children
}

export type HElement = {
    kind: HKindElement
    tag: string
    p?: J
    cn?: Children
}

export type HFunctionComponent = {
    kind: HKindFunctionComponent
    tag: FComponent
    p?: J
    cn?: Children
}

export type HClassComponent = {
    kind: HKindClassComponent
    tag: CComponent
    p?: J
    cn?: Children
    i?: IClassComponent
}

export type HComp = HFunctionComponent | HClassComponent

export type H =
    | HText & { kind?: undefined } // text nodes never have a kind. but this type addition makes H a full DU
    | HElement
    | HFunctionComponent
    | HClassComponent
    | HFragment  

export type HU = H | undefined | null

let isclass = (f: Function) => /^class\s|^class\{/.test(f.toString())

export function jsx(tag: any, p: any, ...cn: any[]): HElement | HFunctionComponent | HClassComponent | HFragment {
    if (tag?.kind) return tag // already an H node, flatten tree

    let kind: HKind = tag == jsxf ? 4 : tag instanceof Function ? (isclass(tag) ? 3 : 2) : 1

    let h: any = { kind }
    if (kind != 4) h.tag = tag
    if (p) h.p = p
    if (cn?.length) h.cn = cn
    return h
}

// fragment is only used above as a sentinel
export let jsxf = Symbol()