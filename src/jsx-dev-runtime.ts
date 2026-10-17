// entry point of the automatic JSX runtime in development ("jsx": "react-jsxdev", or Vite in dev mode)
import { jsx, jsxs } from './jsx-runtime.js'

export { Fragment } from './jsx-runtime.js'
export type { JSX } from './jsx-runtime.js'

/** like jsx and jsxs. the extra arguments for debugging (key, source, self) are not used */
export let jsxDEV = (tag: any, props: any, _key: any, isstaticchildren: boolean) => (isstaticchildren ? jsxs : jsx)(tag, props)
