import type { Children, IClassComponent, HU, J, HFragment } from './h.js'
import { updateview } from './jmc.js'

export type UC = J // update context
export type FComponentT<P> = (props: P) => HU // a function component with typed props. children come in props.children

export type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends Record<string, unknown> ? DeepReadonly<T[K]> : T[K]; }

export const When = ({ cond, children }: { cond: boolean, children?: Children }): HFragment | null => cond ? { kind: 4, cn: children } : null

export abstract class Component<P extends J = {}> implements IClassComponent {

    element!: HTMLElement // assigned by jmc. a placeholder Comment while view() renders nothing
    constructor(public props: P) { }

    // overrides
    mounted() { }
    update(uc?: any): boolean | void { }
    abstract view(): HU

    // utility: updates the component's view
    updateview() { updateview(this.element) }
    get ismounted(): boolean { return !!this.element }
}

export function cc(...namesOrObjects: (string | J | undefined)[]): string {
    return namesOrObjects
        .flatMap(n => typeof n == 'string' ? n : Object.keys(n ?? {}).filter(k => n?.[k])) // objects contribute their truthy keys
        .join(' ')
}

export const focuselement = (e: Node) => (e as HTMLElement).focus()