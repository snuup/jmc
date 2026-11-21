import { jsx } from '../h.js'
import type { InputHTMLAttributes } from '../jsx.js'
import { Component, cc } from '../lib.js'
import './datalistinput.css'

type Props = Omit<InputHTMLAttributes, 'value' | 'oninput' | 'list' | 'type'> & {
    items: string[]
    value: string
    setvalue: (value: string) => void
}

let counter = 0

/**
 * a text input with the browser's own suggestions: a native input with a datalist. any text is allowed.
 * the simple alternative to ComboBox, and the better one on mobile. the browser narrows the suggestions
 * to those matching the text, so with a filled-in value it shows only that one
 */
export class DataListInput extends Component<Props> {

    // the input finds its list by id only, so every instance needs its own
    listid = `jmc-list-${counter++}`

    view() {
        const { items, value, setvalue, class: cls, ...rest } = this.props
        return <div class={cc('jmc-datalist-input', cls)}>
            <input type='text' {...rest} list={this.listid} value={value} oninput={this.oninput} />
            <datalist id={this.listid}>{items.map(i => <option value={i} />)}</datalist>
        </div>
    }

    oninput(ev: Event) {
        this.props.setvalue((ev.target as HTMLInputElement).value)
    }
}
