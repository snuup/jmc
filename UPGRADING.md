# Upgrading from 1.0.x to 1.1

Most of 1.1 is fixes. A few changes need small edits in your code, and some behaviour changed in ways worth checking in your app.

- [Required changes](#required-changes): the code won't compile or will break until you do these
- [Behaviour changes](#behaviour-changes): your code still runs, but renders or updates differently
- [New](#new)
- [Fixes](#fixes)

## Required changes

### `JMXComp` is now `Component`

The class components' base class was renamed along with the library.

```tsx
// 1.0
class Counter extends JMXComp<{ start: number }> { … }

// 1.1
import { Component } from '@snupo/jmc'
class Counter extends Component<{ start: number }> { … }
```

A search and replace of `JMXComp` with `Component` covers it.

### Custom elements are declared on `jsx`, not in a global `JSX` namespace

jmc's element types no longer live in the global `JSX` namespace. TypeScript now finds them on the `jsx` factory function, so they can't clash with the JSX types of other libraries. A custom element declared in the global namespace is no longer seen, and using it is a type error.

```ts
// 1.0
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'my-chart': HtmlHTMLAttributes & { data: number[] }
        }
    }
}

// 1.1
import type { HtmlHTMLAttributes } from '@snupo/jmc'

declare module '@snupo/jmc' {
    namespace jsx {
        namespace JSX {
            interface IntrinsicElements {
                'my-chart': HtmlHTMLAttributes & { data: number[] }
            }
        }
    }
}
```

If your code refers to the type `JSX.IntrinsicElements` directly, use `jsx.JSX.IntrinsicElements`.

`x-autosuggest` was removed from jmc's built-in elements. It belonged to an application. If you use it, declare it as shown above.

### `node.h` is no longer typed on every `Node`

1.0 added the properties `h` (the rendered H) and `ep` to the global `Node` type. 1.1 keeps them internal and no longer changes your `Node` type. At runtime they are still there. If your code reads them, declare them in your project:

```ts
import type { HElement, HComp, J } from '@snupo/jmc'

declare global {
    interface Node {
        h?: HElement | HComp
        ep?: J
    }
}
```

### A class component's `view()` must render exactly one root element

A class component is attached to its root element and updates through it. `view()` returning a fragment or several elements now throws `<Name>.view() must render exactly one root element`. Wrap the content in one element. Returning `null` is allowed: the component then keeps its state and can show itself again later.

## Behaviour changes

### Booleans render nothing

`false` and `true` used to render as the text "false" and "true". Like in React, they now render nothing, so conditions work as expected:

```tsx
<div>{model.error && <p>{model.error}</p>}</div> // 1.0 showed "false" when there was no error
```

`0` still renders as "0". To show a boolean as text, convert it: `{String(flag)}`.

### Children that render nothing keep their place

`null`, `undefined` and booleans now leave an empty text node in the DOM. It's invisible and doesn't appear in `innerHTML`. With it, the elements after a condition keep their position, so they are reused rather than recreated when the condition changes. Inputs keep their focus and value, and islands keep their state. Code that walks `childNodes` or uses `firstChild` may now see these empty text nodes. `children` and `firstElementChild` are unaffected.

### `const` elements: rendered once, then left alone completely

An element with `const` is an island for code outside jmc, such as a map or an editor.

- **Children:** 1.0 never rendered them, not even the first time. 1.1 renders them once, on creation, so `mounted` sees the finished element.
- **Props:** 1.0 kept updating them, so a changed `class` removed the classes a library had added. 1.1 leaves them alone after creation.

The `update` hook still runs on every update. Use it to pass model changes on to the library:

```tsx
<div class='map' const
    mounted={(n) => map = new maplibregl.Map({ container: n })}
    update={() => { map.setStyle(model.style) }}
/>
```

### `updateview` without a target updates `body`

1.0 updated `body` only for `updateview()` with no arguments at all. `updateview({ resized: true })` or `updateview(1)` updated nothing. Now any call without a node or selector updates `body`. The same applies to `updateviewmicro`, `updateviewaf` and `updateviewsync`. Note that `updateviewsync()` with no arguments now updates `body` too. Use `flush()` to only run what is queued.

### Batched updates keep each call's depth and update context

With `updateviewmicro`, `updateviewaf` and `updateviewsync`, all queued calls used to run as one long command list. A depth or update context from one call then applied to the targets of later calls too. Now each call keeps its own. A node queued several times, whether by selector or by reference, is still updated only once.

### `updateview` skips nodes that are no longer in the document

When a selector matches nested elements, updating the outer one can replace an inner one. 1.0 then crashed with `Cannot read properties of null`. 1.1 skips such nodes.

### Element `update` hook: `n.h` is the new render

When an element's `update(n, uc)` hook runs, `n.h` now already holds the H of the current render. In 1.0 it was the previous one. Through `n.h.p` the hook sees the new props.

### `loggedmethods`: logs after the call, including the result

`loggedmethodsex` now calls the logger after the method returns, and passes the result as the third argument. `loggedmethods` and `loggedmethodscolored` print it. Consequences: nested calls are logged inner first, and a call that throws is not logged, so the error surfaces as it is.

### `ismounted` returns a boolean

`Component.ismounted` returned the element itself. It now returns `true` or `false`.

## New

- **`jmcconfig`** holds the settings that adjust jmc:
  - `jmcconfig.debug = true` marks component roots with `comp="Name"`, to see in the dev tools which component rendered what.
  - `jmcconfig.attributes` is the set of prop names always set as attributes, never as properties. It defaults to `selected` and `viewBox`, and you can add your own: `jmcconfig.attributes.add('list')`.
- **Components always receive a props object**, even without props (`<F />`). Destructuring like `({ x }) => …` no longer crashes.
- **A class component's `view()` may return `null`.**

## Fixes

- **Removed props are removed from the DOM:**
  - A prop dropped from the root element of a function component was not removed.
  - Reflected properties like `title` and `id` left an empty attribute behind; they are now removed completely.
  - `aria-label={undefined}` wrote the text "undefined"; it now removes the attribute.
- **Prop changes between loosely equal values are applied:** `0` to `''`, `1` to `true`.
- **`lazy` props:** a dropped or `undefined`-valued `lazy` prop is removed, and `lazy` props are only written to the DOM when their value changes.
- **An element whose `update()` hook handles the update** still gets its new props attached, so a later `updateview` of that element doesn't render stale props.
- **TypeScript projects using `moduleResolution: node16` or `nodenext`** failed to resolve some of jmc's types, or silently got `any`. The published types now resolve in every setup.
