// jmx internal types
// the following types describe the js expression we get from tsx after conversion be our jmx plugin
// they can be useful for users as well, components might return them.

export type Func<T> = () => T
export type Expr<T> = T | Func<T>

export type J = Record<string, any> // a json record
export type Props = J

// Overload signatures
export type Selector = string | Node | undefined | null
export type Selectors = Selector[]

export type FComponent = (props: Props | undefined, children?: Children) => HElement // show an example for usage of children
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
    p?: Props
    cn?: Children
}

export type HFunctionComponent = {
    kind: HKind.FunctionComponent
    tag: FComponent
    p?: Props
    cn?: Children
}

export type HClassComponent = {
    kind: HKind.ClassComponent
    tag: CComponent
    p?: Props
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
    | HText
    | HElement
    | HFunctionComponent
    | HClassComponent
    | HFragment

export interface IUpdateContext {
    patchElementOnly?: boolean
    replace?: boolean
}

declare global {
    // export interface Window {
    //     jmx?: {
    //         getnamespace: (tag: string) => string | undefined
    //     }
    // }
    export interface Node {
        h?: Expr<H>
    }
}

export function jsx(tag: any, p: any, ...cn: any[]): HElement | HFunctionComponent | HClassComponent | HFragment {

    if (tag == jsxf)
        return {
            kind: HKind.Fragment,
            ...(cn?.length ? { cn } : {})
        }
    else if (tag instanceof Function) {
        return (/^class\s|^class\{/.test(tag.toString())) ?
            {
                kind: HKind.ClassComponent,
                tag,
                ...(p ? { p } : {}),
                ...(cn?.length ? { cn } : {})
            } :
            {
                kind: HKind.FunctionComponent,
                tag,
                ...(p ? { p } : {}),
                ...(cn?.length ? { cn } : {})
            }
    }
    else if (tag && typeof tag === 'object' && 'kind' in tag) { // tbd: simplify to object test
        // tag is already a resolved vnode (e.g. <F/> where F is a fragment/element
        // built by a nested/hoisted jsx() call) — substitute it directly instead
        // of wrapping it in a new {kind: Element, tag: ...} node.
        // (props on the <F/> usage itself are dropped/ignored here — see note below)

        console.log("strip!")        

        return tag
    }
    else {
        return {
            kind: HKind.Element,
            tag,
            ...(p ? { p } : {}),
            ...(cn?.length ? { cn } : {})
        }
    }
}

// declare fragment function with similar signature as a function component
export function jsxf(props: any, ...cn: any[]): HFragment {
    throw "never called"
    // return { cn, kind: HKind.Fragment }
}