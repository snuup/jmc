// jmx internal types
// the following types describe the js expression we get from tsx after conversion be our jmx plugin
// they can be useful for users as well, components might return them.

export type Func<T> = () => T
export type Expr<T> = T | Func<T>

export type J = Record<string, any> // a json record

// Overload signatures
export type Selector = string | Node | undefined | null
export type Selectors = Selector[]

export type FComponent = (props: J | undefined, children?: Children) => HElement // show an example for usage of children
//export type FComponentT<P> = (pcn: P, cn?: Children) => H | void

export interface IClassComponent {
    element: Node
    props?: Record<string, any>
    view(): H
    update(uc: IUpdateContext): boolean | void
    mounted?(): void
    //new(props: any): IClassComponent
}

export interface CComponent {
    new(props: any): IClassComponent
}

// export interface FComponentState<P, S> {
//     (this: S & {
//         element: HTMLElement;
//         update: (...ss: Selectors) => void //Action | Selectors | Selector
//         uc?: Selector | Selectors
//     }, p: P): H;
//     state?: S;
// }


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

declare global {
    interface Node {
        h?: H & { p?: J }
    }
}

let isclass = (X: Function) => /^class\s|^class\{/.test(X.toString())

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

// declare fragment function with similar signature as a function component
export function jsxf(props: any, ...cn: any[]): HFragment { throw 2 }