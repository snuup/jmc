import { updateview, rebind, loggedmethods, loggedmethodsex, mount } from '../../jmc/dist/index.js'
import { mraw as m, Todo } from './model'

class Controller {

    constructor() {
        rebind(this)
        window.addEventListener("hashchange", this.setroute)
    }

    setroute() {
        m.filter = ({
            "#/active": "active",
            "#/completed": "completed"
        }[window.location.hash] ?? "all") as Filter
        updateview(".main")
    }

    removeCompletedItems() {
        m.items = m.items.filter(t => !t.completed)
        updateview('main')
    }

    startEdit(ev: Event, item: Todo) {
        m.editingItem = item
        updateview((ev.target as HTMLElement).closest("li"))
    }

    endEdit(ev: Event) {
        m.editingItem = null
        updateview((ev.target as HTMLElement).closest("li"))
    }

    keyUp(ev: KeyboardEvent) {

        const { key, target: { value } } = ev as KeyboardEventInput
        const i = m.editingItem!

        switch (key) {

            case "Enter":
                i.text = value
                if (!value) m.items = m.items.filter(x => x !== i)
                this.endEdit(ev)
                break

            case "Escape":
                this.endEdit(ev)
                break
        }
    }

    setCompleted(ev: Event, item: Todo): void {
        let e = (ev.target as HTMLInputElement)
        item.completed = e.checked
        const li = e.closest("li")
        updateview(".footer", li)
    }

    toggleAllItems(ev: Event) {
        const checked = (ev.target as HTMLInputElement).checked
        m.items.forEach(t => t.completed = checked)
        updateview("ul")
    }

    keydown(ev: KeyboardEvent) {
        if (ev.key === "Enter") {
            const target = ev.target as HTMLInputElement

            let { value } = target
            value = value.trim()

            if (value.length) {
                m.items.push({
                    id: crypto.randomUUID(), // This only works in secure-context.
                    text: value,
                    completed: false,
                })
                target.value = ""
            }
        }
        updateview("ul")
    }

    delItem(item: Todo) {
        m.items = m.items.filter(t => t.id != item.id)
        updateview("ul")
    }
}

//export const c = loggedmethodsex(new Controller(), (name, args, result) => { console.log(chalk.whiteBright.bgGrey.bold(name), args, result) })
export const c = new Controller()