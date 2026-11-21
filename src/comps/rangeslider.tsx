import { jsx } from '../h.js'
import { Component, cc } from '../lib.js'
import './rangeslider.css'

type Props = {
    value: number
    setvalue: (value: number) => void
    min?: number
    max?: number
    step?: number
    class?: string
    disabled?: boolean
}

/** a styled native range input. setvalue is called while dragging */
export class RangeSlider extends Component<Props> {

    view() {
        const { value, min, max, step, class: cls, disabled } = this.props
        // value comes last: the browser clamps it to the range, so min, max and step must be set before
        return <input type='range' class={cc('jmc-range-slider', cls)} disabled={disabled} min={min} max={max} step={step} value={value} oninput={this.oninput} />
    }

    oninput(ev: Event) {
        this.props.setvalue(parseFloat((ev.target as HTMLInputElement).value))
    }
}
