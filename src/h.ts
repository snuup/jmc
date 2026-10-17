import type { JmcIntrinsicElements } from './jsx.js'

export type J = Record<string, any> // a json record

export type Selector = string | Node

/** an updateview command: a target (selector or node), a depth (number) or an update context (object) */
export type Command = Selector | J | number

export type FComponent = (props: J, children?: Children) => HU

type HKindElement = 1
type HKindFunctionComponent = 2
type HKindClassComponent = 3
type HKindFragment = 4

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
    | boolean // renders nothing, like null and undefined

export type HFragment = {
    kind: HKindFragment
    cn?: Children
}

export type HElement = {
    kind: HKindElement
    tag: string
    p: J
    cn?: Children
}

export type HFunctionComponent = {
    kind: HKindFunctionComponent
    tag: FComponent
    p: J
    cn?: Children
}

export type HClassComponent = {
    kind: HKindClassComponent
    tag: CComponent
    p: J
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

export function jsx(tag: any, p: any, ...cn: any[]): HElement | HComp | HFragment {
    if (tag?.kind) return tag // already an H node, flatten tree

    let kind: HKind = tag == jsxf ? 4 : tag instanceof Function ? (isclass(tag) ? 3 : 2) : 1

    let h: any = { kind, p: p ?? {} }
    if (kind != 4) h.tag = tag
    if (cn?.length) h.cn = cn
    return h
}

// typescript looks up the JSX types on the factory function first: jsx.JSX instead of a global JSX namespace.
// so jmc's element types cannot clash with other libraries. add your own elements by augmenting jsx.JSX.IntrinsicElements
export namespace jsx {
    export namespace JSX {
        export interface IntrinsicElements extends JmcIntrinsicElements { }
    }
}

// fragment is only used above as a sentinel
export let jsxf = Symbol()