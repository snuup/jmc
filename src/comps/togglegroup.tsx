import { jsx } from '../h.js'
import { Component, cc } from '../lib.js'
import './togglegroup.css'

type Props<T> = {
    items: T[]
    value: T | undefined
    setvalue: (item: T) => void
    label?: (item: T) => any // text or any view, such as an Icon. default: String(item)
    class?: string
    disabled?: boolean
}

/** a row of buttons, of which exactly one is selected: a segmented control. keyboard accessible, as the items are buttons */
export class ToggleGroup<T = any> extends Component<Props<T>> {

    view() {
        const { items, value, setvalue, label = String, class: cls, disabled } = this.props
        return <div role='radiogroup' class={cc('jmc-toggle-group', cls)}>
            {items.map(i => <button type='button' role='radio' aria-checked={i === value} disabled={disabled} class={cc({ selected: i === value })} onclick={() => setvalue(i)}>{label(i)}</button>)}
        </div>
    }
}
