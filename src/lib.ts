import type { Children, IClassComponent, HU, J, HFragment } from './h';
import { updateview } from './jmc.js'

export type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends Record<string, unknown> ? DeepReadonly<T[K]> : T[K]; }

export const When = ({ cond }: { cond: boolean }, cn: Children): HFragment | null => cond ? { kind: 4, cn } : null

export abstract class JMXComp<P extends J = {}> implements IClassComponent {

    element!: HTMLElement // assigned by jmx framework. a placeholder Comment while view() renders nothing
    constructor(public props: P) { }

    // overrides
    mounted() { }
    update(uc?: any): boolean | void { }
    abstract view(): HU

    // utility: updates the component's view
    updateview() { updateview(this.element) }
    get ismounted(): boolean { return this.element as any }
}

export function cc(...namesOrObjects: (string | J | undefined)[]): string {
    return namesOrObjects
        .filter(x => x !== undefined)
        .flatMap(n => (n.trim ? n : Object.keys(n).filter(k => (n as J)[k]))) // n.trim distinguishes string from J
        .join(' ') 
}

export const focuselement = (e: Node) => (e as HTMLElement).focus()