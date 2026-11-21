import { jsx } from '../h.js'
import type { SelectHTMLAttributes } from '../jsx.js'
import { Component, cc } from '../lib.js'
import './select.css'

type Props<T> = Omit<SelectHTMLAttributes, 'value' | 'onchange' | 'oninput'> & {
    items: T[]
    value: T | undefined
    setvalue: (item: T) => void
    label?: (item: T) => string // default: String(item)
}

/** a native select over any items. it hands out the item, not text */
export class Select<T = any> extends Component<Props<T>> {

    view() {
        const { items, value, setvalue, label = String, class: cls, ...rest } = this.props
        return <select {...rest} class={cc('jmc-select', cls)} onchange={this.onchange}>
            {items.map(i => <option>{label(i)}</option>)}
        </select>
    }

    mounted() { this.select() }

    // runs before the render. the options exist only after it, so the selection is set after it
    update() { queueMicrotask(this.select) }

    // the options are plain, so the item is found by position. no value strings to match
    select() {
        (this.element as HTMLSelectElement).selectedIndex = this.props.items.indexOf(this.props.value as T)
    }

    onchange(ev: Event) {
        this.props.setvalue(this.props.items[(ev.target as HTMLSelectElement).selectedIndex])
    }
}
