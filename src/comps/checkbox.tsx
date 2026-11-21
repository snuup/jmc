import { jsx } from '../h.js'
import type { InputHTMLAttributes } from '../jsx.js'
import { Component, cc } from '../lib.js'
import './checkbox.css'

type Props = Omit<InputHTMLAttributes, 'checked' | 'indeterminate' | 'onchange' | 'oninput' | 'type' | 'value'> & {
    checked: boolean | 'mixed' // 'mixed' is the third state, for a group of which only some are checked
    setchecked: (checked: boolean) => void
    round?: boolean
    children?: any // the label: text or a view
}

/** a checkbox with a third state. a click on 'mixed' hands out true. class and style go to the label */
export class Checkbox extends Component<Props> {

    view() {
        const { checked, setchecked, round, class: cls, style, children, ...rest } = this.props
        return <label class={cc('jmc-checkbox', { 'jmc-round': round }, cls)} style={style}>
            <input type='checkbox' {...rest} checked={checked === true} indeterminate={checked === 'mixed'} onchange={this.onchange} />
            {children}
        </label>
    }

    onchange(ev: Event) {
        const i = ev.target as HTMLInputElement
        this.props.setchecked(i.checked)
        // the click changed the element. jmc writes only props that changed, so show what the model decided
        i.checked = this.props.checked === true
        i.indeterminate = this.props.checked === 'mixed'
    }
}
