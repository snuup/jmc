# jmc design guide

This guide is for Claude, and other coding agents, working in an app built with jmc. Read it before you change model, view or controller code. It describes how such an app is structured and the rules that keep that structure intact. People new to the codebase can read it too.

For the API itself (`patch`, `updateview`, components, props), see the [readme](readme.md).

## The core idea

Apps that use jmc follow a well-defined MVC architecture. The code lives in three folders:

```
model/
view/
controller/
```

Each part has one job, and the boundaries between them are strict.

### Model

The model is a plain JavaScript object (POJO): no proxies, no observables, no setters, no classes with behaviour. A value changes by plain assignment.

The model is held by a variable that is never reassigned. That variable is either `m`, or more often `vm`, a view model that holds the domain model in its field `m`. The view model adds the state that only the UI cares about, such as the current selection or an open dialog. Usually `vm` or `m` is global.

```ts
// model/model.ts
export const vm = {
    m: { todos: [] as Todo[] },     // the domain model
    filter: 'all' as Filter,        // UI state
    editing: undefined as Todo | undefined,
}
```

Because `vm` and `m` never change identity, every part of the app can hold on to them. Content changes happen inside them: assign fields, push to arrays, replace sub-objects. Never write `vm = …` or `vm.m = …` to "reset" state. Clear or reassign the fields instead.

### View

The view is written in TSX. The TSX creates vdom objects, and jmc uses them to update the real DOM.

When the vdom comes from a function component, jmc attaches that function to the DOM element it created. Calling `updateview(element)` runs the function again with the current model and updates that element. Making view updates this easy is a central idea of jmc: you don't track what changed, you re-render the part of the page that might be affected.

```tsx
// view/todolist.tsx
export const TodoList = () =>
    <ul id='todos'>
        {vm.m.todos.map(t => <li class={cc({ done: t.done })}>{t.text}</li>)}
    </ul>
```

The view turns model values into DOM elements, and nothing else. It operates on a **read-only** model. TypeScript can enforce this with jmc's `DeepReadonly` type: the view reads the model through a read-only alias of the same object.

```ts
// model/model.ts
export const rvm: DeepReadonly<typeof vm> = vm   // the view imports rvm, controllers import vm
```

This comes at a cost: `DeepReadonly` changes the model's types as the view sees them. With a complex model, the resulting types and error messages can get hard for people to read. A project may therefore decide to follow the rule without `tsc` enforcing it. Where it is not enforced, the programmer must keep to it.

Whether to enforce it is the project's decision. **Don't add or remove `DeepReadonly` enforcement without asking first.** Follow the project's existing choice, and don't loosen types or add casts to get around it.

User input in the view goes to a controller method. The view never handles it by changing the model itself.

```tsx
<button onclick={() => todoctrl.add(vm.newtext)}>Add</button>
```

### Controller

Controllers are typically stateless and usually global singletons.

- **Only controllers update the model.**
- **Only controllers call `updateview`**, after they changed the model.

A controller method has two parts:

1. modify the model
2. call `updateview()` for the parts of the view that might be affected

```ts
// controller/todocontroller.ts
class TodoController {
    add(text: string) {
        vm.m.todos.push({ text, done: false })   // 1. modify the model
        updateview('#todos', '#count')            // 2. update the affected view
    }
    toggle(t: Todo) {
        t.done = !t.done
        updateview('#todos', '#count')
    }
}
export const todoctrl = rebind(new TodoController())
```

`rebind` binds the methods to the instance, so they can also be passed directly as event handlers.

This isn't specific to controllers. In JavaScript, a method passed on by itself (as an event handler, a callback, `arr.map(o.f)`) loses its `this`. So apply `rebind` to every instance of a class whose methods use `this`: `rebind(new X())`, or `rebind(this)` in the constructor. jmc does this for class components already, so don't call it there.

`rebind` binds only the methods of the object's own class, not methods inherited from a base class. For those, call `rebind(o, Base.prototype)` as well.

An asynchronous controller method follows the same pattern after each `await`: change the model, then update the view.

```ts
async load() {
    vm.loading = true
    updateview('#status')
    vm.m.todos = await fetchtodos()
    vm.loading = false
    updateview()
}
```

## Rules

When you write or change code in a jmc app:

- **Don't change the model in the view.** That includes event handlers written inline in TSX: they call a controller method. It also includes mutating array methods: `vm.m.todos.sort(…)` in a view sorts the model. Use `toSorted`, `toReversed`, `filter`, `map` or a copy.
- **Don't call `updateview` from the view or the model.** Class components calling `this.updateview()` for their own local state are the exception, see below.
- **Don't reassign `m` or `vm`.** Change their contents.
- **Keep the model plain.** Don't add proxies, signals, observables, stores, getters with side effects, or state libraries. Derived values are computed in the view, or in plain functions the view calls.
- **Keep controllers stateless.** State belongs in the model or view model, where the view can see it.
- **After changing the model, update every part of the view it might affect.** If you are unsure which parts that are, update a larger part. `updateview()` with no arguments updates the whole page and is always correct. Updating too much only costs time; updating too little leaves the page showing stale data, which is a bug.
- **Give update targets a stable handle.** The root element of a function component that controllers update on its own gets an `id` or a class, so a controller can name it in `updateview('#todos')`.

### Class components

A class component is like a function component that can hold state. Its `view()` method plays the part of the function, and jmc creates the instance once and reuses it as long as the same class is rendered at the same place. Fields of the instance survive re-renders, and the component can update itself with `this.updateview()`.

```tsx
class Dropdown extends Component<{ items: string[], onpick: (s: string) => void }> {
    open = false
    toggle() { this.open = !this.open; this.updateview() }
    view(): H {
        return <div class={cc('dropdown', { open: this.open })}>
            <button onclick={this.toggle}>▾</button>
            {this.open && <ul>{this.props.items.map(s => <li onclick={() => this.props.onpick(s)}>{s}</li>)}</ul>}
        </div>
    }
}
```

Use a class component for a self-contained widget whose state no other part of the app needs, like `open` above. Such a component is its own small model and controller. State that the rest of the app reads or changes belongs in the model, and the code that changes it belongs in a controller. In the example, `onpick` would be a controller method.

`mounted()` runs once after the first render, when the whole tree is in the DOM, and `update(uc)` runs before each re-render (return `true` to skip it). See the readme for all members.

### Islands

Content managed by another library, such as a map or an editor, lives in an element marked `const`. jmc renders it once and leaves it alone afterwards. Controllers still own the model. The island's `update` callback passes model changes on to the library. See the readme for details.

## Updating the view

`updateview(...)` updates right away: when it returns, the DOM shows the current model. Use it by default.

Three variants don't update right away. They queue the update and run all queued updates together later, and an element queued several times is updated once:

| function | runs the queued updates | use it when |
|---|---|---|
| `updateviewaf(...)` | at the next animation frame | events fire faster than the screen redraws: `mousemove`, `pointermove`, `scroll`, `resize`, dragging. The view updates at most once per frame. |
| `updateviewmicro(...)` | at the next microtask | one action calls several controller methods that each update the view. Their updates collapse into one, still before the browser paints. |
| `updateviewsync(...)` | immediately, together with everything queued | you need the DOM up to date now, for example to measure or focus an element, while other updates are queued. |

`flush()` runs everything queued, immediately.

After `updateviewaf` or `updateviewmicro`, the DOM is not updated yet. Code that reads the DOM right after the call, measures it or focuses an element sees the old state. Use `updateview` or `updateviewsync` there.

All of them take the same arguments as `updateview`: selectors, elements, a depth number, an update context object. Like `updateview`, they are called only by controllers.

## Utilities

jmc exports a few helpers. Use them instead of writing your own:

| helper | what it does | typical use |
|---|---|---|
| `cc(...)` | joins class names. Objects contribute their keys with truthy values | `class={cc('item', { active: t === vm.selected, done: t.done })}` in the view |
| `<When cond={…}>` | renders its children only if `cond` is true | conditional blocks with several children. For a single element, `{cond && <p>…</p>}` is enough |
| `live(f)` | a prop value that is evaluated at each render, not when the JSX is created | a prop that must read the model at update time |
| `DeepReadonly<T>` | a type that makes all nested fields read-only | the view's read-only access to the model, see [View](#view) |
| `rebind(o)` | binds the prototype methods of `o` to `o` | every class instance whose methods use `this`, such as controllers: `export const todoctrl = rebind(new TodoController())`, so `onclick={todoctrl.clear}` works. Class components are rebound by jmc already |
| `closestby(node, pred)` | the nearest ancestor of `node`, or `node` itself, matching `pred` | event delegation: find the item element from `event.target` |
| `focuselement(node)` | focuses the node | in `mounted`, or in a controller after `updateview` |
| `mount({ … })` | puts values on `globalThis` | debugging: `mount({ vm, todoctrl })` makes model and controllers reachable in the browser console |
| `loggedmethods(o)` | wraps `o` so that each method call is logged with its arguments and result | debugging controllers: `export const todoctrl = loggedmethods(rebind(new TodoController()))` shows every action in the console. `loggedmethodscolored(color, o)` picks the log color |

`jmcconfig.debug = true` marks each component root with its name (`comp="TodoList"`), so the dev tools show which component rendered what.

## Where things go

| you need to… | put it in |
|---|---|
| store data or UI state | a field of `m` or `vm`, in `model/` |
| show data | a component in `view/` |
| react to a click, input or other event | a controller method in `controller/`, called from the view |
| load or save data | a controller method, which updates the model and then the view |
| compute a value derived from the model | a plain function, called by the view |
