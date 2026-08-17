import { updateview, rebind } from '../../jmc/src/index.js'
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

    startEdit(ev: Event) {
        let { model, li } = from(ev)
        m.editingItem = model
        updateview(li)
    }

    endEdit(ev: Event) {
        let { li } = from(ev)
        m.editingItem = null
        updateview(li)
    }

    keyUp(ev: KeyboardEvent) {

        switch (ev.key) {

            case "Enter": {
                let i = m.editingItem!
                if (!(i.text = (ev.target as HTMLInputElement).value)) m.items = m.items.filter(x => x !== i)
                this.endEdit(ev)
                break
            }

            case "Escape": {
                this.endEdit(ev)
                break
            }
        }
    }

    setCompleted(ev: Event): void {
        let { model, li } = from(ev)
        model.completed = (ev.target as HTMLInputElement).checked
        updateview(li, ".footer")
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

    delItem(ev: Event) {
        let { model } = from(ev)
        let delid = model.id
        m.items = m.items.filter(t => t.id != delid)
        updateview("ul")
    }
}

const from = (ev: Event) => {
    let li = (ev.target as HTMLElement).closest("li")!
    let model = (li as any).model as Todo
    return { li, model }
}

// import chalk from 'chalk'
// export const c = loggedmethodsex(new Controller(), (name, args, result) => { console.log(chalk.whiteBright.bgGrey.bold(name), args, result) })
export const c = new Controller()

