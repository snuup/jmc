import { cc, HElement, jsx, patch, When } from '../../jmc/src/index.js'

import { c } from './controller'
import { m, type Todo } from './model'
import 'todomvc-app-css/index.css'
import 'todomvc-common/base.css'

const Header = () => <header class="header">
    <h1>todos</h1>
    <input class="new-todo" onkeydown={c.keydown} placeholder="What needs to be done?" autofocus />
</header>

const Footer = () => <footer class="footer">
    <span class="todo-count">
        <strong>{m.activecount}</strong> {m.activecount == 1 ? "item" : "items"} left
    </span>
    <ul class="filters">
        <li><a class={cc({ selected: m.filter == "all" })} href="#/">All</a></li>
        <li><a class={cc({ selected: m.filter == "active" })} href="#/active">Active</a></li>
        <li><a class={cc({ selected: m.filter == "completed" })} href="#/completed">Completed</a></li>
    </ul>
    <When cond={m.anycompleted}>
        <button class="clear-completed" onclick={c.removeCompletedItems}>Clear completed</button>
    </When>
</footer>

const Item = ({ item }: { item: Todo }) => {
    const editing = m.editingItem == item
    const completed = item.completed
    return <li class={cc({ completed, editing })} >

        <div class="view">
            <input class="toggle" type="checkbox" onchange={ev => c.setCompleted(ev, item)} checked={completed} />
            <label ondblclick={ev => c.startEdit(ev, item)}>{item.text}</label>
            <button onclick={() => c.delItem(item)} class="destroy" />
        </div>

        <When cond={editing}>
            <div class="input-container">
                <input id="edit-todo-input" class="edit" value={item.text} onkeyup={c.keyUp} onblur={c.endEdit} mounted={e => (e as HTMLElement).focus()} />
            </div>
        </When>

    </li>
}

// interface FComponentState<P> extends P {
//     (this: {
//         element: HTMLElement;
//         //update: (...ss: Selectors) => void //Action | Selectors | Selector
//         //uc?: Selector | Selectors
//     }, p: P): H
// }

type Component<P> = (this: {
    element: HTMLElement
    initialized: boolean
    h: H
}, props: P) => H

let z1 = <div></div>
let z2 = jsx("div", {})

const Item2: Component<{ item: Todo }> = function ({ item }) {

    let onchange = (ev: Event) => c.setCompleted2(this.element, item, (ev.target as HTMLInputElement).checked)
    let ondblclick = () => c.startEdit2(this.element, item)
    let onclick = () => c.delItem(item)
    let inputmounted = (e: Node) => (e as HTMLElement).focus()

    this.initialized = true

    return () => {
        const editing = m.editingItem == item
        const completed = item.completed
        return <li class={cc({ completed, editing })} >

            <div class="view">
                <input class="toggle" type="checkbox" onchange={onchange} checked={completed} />
                <label ondblclick={ondblclick}>{item.text}</label>
                <button onclick={onclick} class="destroy" />
            </div>

            <When cond={editing}>
                <div class="input-container">
                    <input id="edit-todo-input" class="edit" value={item.text} onkeyup={c.keyUp} onblur={c.endEdit} mounted={inputmounted} />
                </div>
            </When>

        </li>
    }
}

const focuselement = (e: Node) => (e as HTMLElement).focus()

const Item3 = ({ item }: { item: Todo }) => {
    
    const editing = m.editingItem == item
    const completed = item.completed

    return <li class={cc({ completed, editing })} model={item} >

        <div class="view">
            <input class="toggle" type="checkbox" onchange={c.setCompleted3} checked={completed} />
            <label ondblclick={c.startEdit3}>{item.text}</label>
            <button onclick={c.delItem3} class="destroy" />
        </div>

        <When cond={editing}>
            <div class="input-container">
                <input id="edit-todo-input" class="edit" value={item.text} onkeyup={c.keyUp} onblur={c.endEdit} mounted={focuselement} />
            </div>
        </When>

    </li>
}

const Main = () => <main class="main">
    <div class="toggle-all-container">
        <input class="toggle-all" id="toggle-all" type="checkbox" onchange={c.toggleAllItems} checked={m.allarecompleted} />
        <label for="toggle-all">Mark all as complete</label>
    </div>
    <ul class="todo-list">
        {m.filtereditems.map(t => <Item item={t} />)}
    </ul>
    <Footer />
</main>

export const App = () => <section class="todoapp">
    <Header />
    <Main />
</section>

patch(document.querySelector(".todoapp"), <App />)