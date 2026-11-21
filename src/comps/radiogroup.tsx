import { jsx } from '../h.js'
import { Component, cc } from '../lib.js'
import './radiogroup.css'

type Props<T> = {
    items: T[]
    value: T | undefined
    setvalue: (item: T) => void
    label?: (item: T) => any // default: String(item)
    color?: (item: T) => string | undefined // tints the item's radio
    class?: string
    disabled?: boolean
}

let counter = 0

/** native radio inputs, one per item, in a row. a radio needs a group name to be exclusive, unique per instance */
export class RadioGroup<T = any> extends Component<Props<T>> {

    name = `jmc-radio-${counter++}`

    view() {
        const { items, value, setvalue, label = String, color, class: cls, disabled } = this.props
        return <div role='radiogroup' class={cc('jmc-radio-group', cls)}>
            {items.map(i =>
                <label>
                    <input type='radio' name={this.name} checked={i === value} disabled={disabled}
                        style={color?.(i) ? `accent-color:${color(i)}` : undefined} onchange={() => this.onchange(i)} />
                    {label(i)}
                </label>)}
        </div>
    }

    onchange(item: T) {
        this.props.setvalue(item)
        // the click checked the radio. jmc writes only props that changed, so show what the model decided
        const { items, value } = this.props
        this.element.querySelectorAll('input').forEach((r, n) => r.checked = items[n] === value)
    }
}
