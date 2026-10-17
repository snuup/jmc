# jmc

A minimal JSX/TSX view library that syncs your views directly with the real DOM.

- small enough to read in one sitting: the core is a single file of about 200 lines
- statically typed views with TSX
- you decide what to update and when: one call, scoped to any element
- plain objects as model, plain classes as controller, nothing hidden in between

```tsx
import { jsx, patch, updateview } from '@snupo/jmc'

const model = { count: 0 }

const App = () =>
    <body>
        <button onclick={() => { model.count++; updateview() }}>+1</button>
        <span>{model.count}</span>
    </body>

patch(document.body, <App />)
```

## Install

```sh
npm install @snupo/jmc
```

jmc uses the classic JSX transform with its own factory functions `jsx` and `jsxf` (for fragments). In `tsconfig.json`:

```jsonc
{
    "compilerOptions": {
        "jsx": "react",
        "jsxFactory": "jsx",
        "jsxFragmentFactory": "jsxf"
    }
}
```

Your bundler needs the same settings. With Vite's oxc transformer:

```ts
// vite.config.ts
export default defineConfig({
    oxc: {
        jsx: { runtime: 'classic', pragma: 'jsx', pragmaFrag: 'jsxf' },
    },
})
```

With esbuild, the options are `jsxFactory: 'jsx'` and `jsxFragment: 'jsxf'`.

Every `.tsx` file then imports `jsx`, and `jsxf` if it uses fragments (`<>…</>`).

## The idea

An application is split into three parts with clear responsibilities.

**Model**: a plain object. No proxies, no observables, no special setters. You change a value by assigning it. The model instance itself stays stable.

**Controller**: a plain class whose methods are the application's operations. Only the controller changes the model. Other parts, like the view, treat it as read-only. After an action, the controller updates the parts of the view that the action affected.

Deciding which parts to update is a small, explicit step for the programmer. In return, there is no hidden machinery to learn, debug or work around, and no diffing of old and new state.

**View**: the DOM, described with statically typed TSX. jmc renders it and keeps it in sync. An update can be as coarse as the whole page or as fine as a single element.

## Rendering and updating

`patch(node, h)` renders `h` in place of `node` and returns the rendered element. The usual start is to patch `document.body` with a `<body>` element:

```tsx
patch(document.body, <App />)
```

`updateview(...commands)` brings rendered parts of the page up to date. jmc remembers how each element was rendered, so it renders it again with the current model:

```tsx
updateview()                  // the whole body
updateview('#todos')          // all elements matching a selector
updateview(element)           // one element
updateview('#todos', '.badge') // several targets
```

jmc compares the new render with the existing DOM and changes only what differs. Existing elements are reused, so focus, selection and scroll positions stay intact.

Two more kinds of commands change how the targets after them are updated:

- **a number** limits the depth. `updateview(1, el)` updates only the props of `el`, not its children. `updateview(0, el)` discards the children of `el` and renders them from scratch.
- **an object** is passed as update context to all `update` hooks (see below): `updateview({ resized: true })`.

Without a target, `updateview` updates `body`.

### Batching

These variants collect updates and run them together:

| function | runs the update |
|---|---|
| `updateviewmicro(...)` | at the next microtask |
| `updateviewaf(...)` | at the next animation frame |
| `updateviewsync(...)` | immediately, together with everything queued |
| `flush()` | runs everything queued, immediately |

An element queued several times is updated once.

## Components

### Function components

A function component receives its props and children and returns JSX:

```tsx
const TodoList = (p: { items: string[] }) =>
    <ul id='todos'>{p.items.map(t => <li>{t}</li>)}</ul>

patch(document.body, <body><h1>Todos</h1><TodoList items={model.todos} /></body>)

model.todos.push('bread')
updateview('#todos') // runs TodoList again
```

When you update the root element of a function component, the function runs again. A component that returns a fragment has no single root element. It is updated through its parent.

### Class components

A class component keeps state between renders. Its instance is created once and reused as long as the same class is rendered at the same place:

```tsx
class Counter extends Component<{ start: number }> {
    count = this.props.start
    inc() { this.count++; this.updateview() }
    view(): H { return <button onclick={this.inc}>{this.count}</button> }
}

patch(document.body, <body><Counter start={5} /></body>)
```

| member | |
|---|---|
| `view()` | returns the component's JSX: exactly one root element, or `null` to render nothing |
| `props` | the current props, updated on every render by the parent |
| `element` | the rendered root element |
| `mounted()` | called once, after the first render |
| `update(uc)` | called before each re-render. Return `true` to skip the re-render, for example after updating the DOM yourself |
| `updateview()` | updates this component |
| `ismounted` | `true` once rendered |

Methods are bound to the instance, so they can be used directly as event handlers, as `onclick={this.inc}` above shows.

A component whose `view()` returns `null` keeps its state and can show itself again later.

## Elements

### Props: attributes and properties

jmc sets a prop as a DOM **property** when the value is an object or a function, or when the element has a property of that name, as `value`, `checked` and `onclick` do. Otherwise it sets an **attribute**. `style` given as a string is set as an attribute.

`null`, `undefined` and `false` remove the attribute. On `aria-*` attributes, `false` is kept as the value `"false"`.

A prop whose value is wrapped in `lazy` is evaluated at each render:

```tsx
<dd class={lazy(() => cc('item', { active: model.active }))} />
```

### Children

Strings and numbers render as text. `null`, `undefined` and `false` render nothing, so conditions read naturally:

```tsx
<div>{model.error && <p class='error'>{model.error}</p>}</div>
```

Arrays are flattened, so `items.map(…)` works anywhere.

### Hooks

Elements accept two hooks:

```tsx
<canvas
    mounted={(n) => draw(n)}                          // once, after the element is created
    update={(n, uc) => { draw(n, uc); return true }}  // before each update. true: skip the default update
/>
```

### Islands

jmc leaves the children of an element with the `const` attribute alone. That's useful for content managed by other code, such as a map or an editor. jmc also leaves the children of web components (tags containing `-`) to the component itself.

### SVG

Give `<svg>` its namespace. Its children inherit it, and the children of `<foreignObject>` are HTML again:

```tsx
<svg xmlns='http://www.w3.org/2000/svg'><circle r={5} /></svg>
```

### Custom elements

Declare your own tags and their props for TypeScript:

```ts
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'my-chart': HtmlHTMLAttributes & { data: number[] }
        }
    }
}
```

## Utilities

| | |
|---|---|
| `cc(...)` | joins class names. Objects contribute their keys with truthy values: `cc('item', { active })` |
| `<When cond={…}>` | renders its children only if `cond` is true |
| `lazy(f)` | a prop value that is evaluated at each render |
| `closestby(node, pred)` | the nearest ancestor (or the node itself) matching `pred` |
| `focuselement(node)` | focuses the node |
| `rebind(o)` | binds the prototype methods of `o` to `o` |
| `mount({ … })` | puts values on `globalThis`, handy for debugging in the console |
| `loggedmethods(o)` | logs each method call of `o` with its arguments and result |

## License

[MIT](LICENSE)
