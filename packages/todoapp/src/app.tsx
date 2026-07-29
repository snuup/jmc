import { cc, jsx, patch, When } from '../../jmc/src'

import { c } from './controller'
import { m, type Todo } from './model'
import 'todomvc-app-css/index.css'
import 'todomvc-common/base.css'

const Header = <header class="header">
    <h1>todos</h1>
    <input class="new-todo" onkeydown={c.keydown} placeholder="What needs to be done?" autofocus />
</header>

const Footer = <footer class="footer">
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

const Item = ({ item: item }: { item: Todo }) => {
    const editing = m.editingItem == item
    const completed = item.completed
    return <li class={cc({ completed, editing })} >

        <div class="view">
            <input class="toggle" type="checkbox" onchange={(ev) => c.setCompleted(ev, item)} checked={completed} />
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

patch(document.querySelector(".todoapp"), App)