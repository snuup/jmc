import type { Children, IClassComponent, IUpdateContext, H, J } from './h';
import { updateview } from './jmc.js'

export type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends Record<string, unknown> ? DeepReadonly<T[K]> : T[K]; }

export const When = ({ cond }: { cond: boolean }, cn: Children) => cond ? { cn } : void 0;

export abstract class JMXComp<P extends J = {}> implements IClassComponent {

    element!: HTMLElement // assigned by jmx framework
    constructor(public props: P) { }

    // overrides
    mounted() { }
    update(uc?: IUpdateContext): boolean | void { }
    abstract view(): H

    // utility: updates the component's view
    updateview() { updateview(this.element) }
    get ismounted():boolean { return this.element as any }
}

export function cc(...namesOrObjects: (string | any)[]): string {
    return namesOrObjects.flatMap(n => (n.trim ? n : Object.keys(n).filter(k => n[k]))).join(' ') // n.trim distinguishes strings from objects
}