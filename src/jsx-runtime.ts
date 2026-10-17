// entry point of the automatic JSX runtime, used with "jsx": "react-jsx" and "jsxImportSource": "@snupo/jmc".
// the compiler then imports jsx, jsxs and Fragment from here by itself, so .tsx files need no jsx import.
// it passes the children inside the props: jsx(tag, { ...props, children }). this adapts that to jmc's jsx(tag, props, ...children)
import { jsx as classic, jsxf } from './h.js'

export { jsxf as Fragment }

/** an element with one child or none */
export let jsx = (tag: any, { children, ...p }: any) => classic(tag, p, ...(children === undefined ? [] : [children]))

/** an element with several children, always an array */
export let jsxs = (tag: any, { children, ...p }: any) => classic(tag, p, ...children)

export namespace JSX {
    // the same elements as in classic mode. the automatic runtime type-checks children as a prop, so every element accepts them
    export type IntrinsicElements = { [K in keyof classic.JSX.IntrinsicElements]: classic.JSX.IntrinsicElements[K] & { children?: any } }
}
