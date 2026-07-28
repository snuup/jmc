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
    cn: Children
}

export type HElement = {
    tag: string
    p: Props
    cn: Children
    i?: any
}

export type HCompFun = {
    tag: FComponent
    p: Props
    cn?: Children
}

export type HCompClass = {
    tag: CComponent
    p: Props
    cn: Children
    i: IClassComponent
}

export type HComp = HCompFun | HCompClass

export type H = // a hyperscript atom that describes a ...
    | HText
    | HElement // a tag, like p, div with attributes and children
    | HComp // a dynamic component computing any other HNode
    | HFragment

export type HC = // a hyperscript atom that describes a ...
    | HElement // a tag, like p, div with attributes and children
    | HComp // a dynamic component computing any other HNode
    | HFragment

export interface IUpdateContext {
    patchElementOnly?: boolean
    replace?: boolean
}

declare global {
    export interface Window {
        jmx?: {
            getnamespace: (tag: string) => string | undefined
        }
    }
    export interface Node {
        h?: Expr<HElement | HCompFun | HCompClass>
    }
}