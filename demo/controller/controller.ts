import { rebind, updateview } from '@snupo/jmc'
import { m } from '../model/model'

class Controller {
    setvalue(x: number) { m.value = x; updateview() }
    setcategory(x: string) { m.category = x; updateview() }
    setnote(x: string) { m.note = x; updateview() }
    setdirection(x: typeof m.direction) { m.direction = x; updateview() }
    toggledisabled() { m.disabled = !m.disabled; updateview() }

    setchecked(category: string, checked: boolean) {
        m.checked[category] = checked
        updateview()
    }

    // the master checkbox: all on, or all off
    setallchecked(checked: boolean) {
        m.categories.forEach(c => m.checked[c] = checked)
        updateview()
    }
}

export const c = rebind(new Controller())
