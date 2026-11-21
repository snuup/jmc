import { jsx } from '../h.js'
import { Component, cc } from '../lib.js'
import './numberstepper.css'

type Props = {
    value: number
    setvalue: (value: number) => void
    min?: number
    max?: number
    step?: number // default 1
    decimals?: number // default: the decimals of step
    class?: string
    disabled?: boolean
}

const decimalsof = (x: number) => (String(x).split('.')[1] ?? '').length

const round = (v: number, decimals: number) => {
    const factor = 10 ** decimals
    return Math.round((v + Number.EPSILON) * factor) / factor
}

/** a number input with minus and plus buttons */
export class NumberStepper extends Component<Props> {

    view() {
        const { disabled, class: cls } = this.props
        return <div class={cc('jmc-stepper', { disabled }, cls)}>
            <button type='button' disabled={disabled} onclick={this.ondecrement}>&minus;</button>
            <input type='text' disabled={disabled} value={this.text} onchange={this.onchange} onkeydown={this.onkeydown} />
            <button type='button' disabled={disabled} onclick={this.onincrement}>&#43;</button>
        </div>
    }

    get step() { return this.props.step ?? 1 }
    get decimals() { return this.props.decimals ?? decimalsof(this.step) }
    get text() { return this.props.value.toFixed(this.decimals) }

    // min and max bound the buttons only while the value is inside them. typed text may leave the range,
    // and from there the buttons step freely
    increment(by: number) {
        const { value, min = -Infinity, max = Infinity } = this.props
        let v = round(value + by, this.decimals)
        if (value >= min && value <= max) v = Math.min(max, Math.max(min, v))
        this.props.setvalue(v)
    }

    // fires on blur and enter. invalid text reverts to the current value, valid text is taken unclamped
    onchange(ev: Event) {
        const i = ev.target as HTMLInputElement
        const v = Number(i.value.trim().replace(',', '.'))
        if (i.value.trim() && Number.isFinite(v)) this.props.setvalue(round(v, this.decimals))
        i.value = this.text // jmc only writes a value when it changed, so rejected or rounded text would stay otherwise
    }

    onkeydown(ev: KeyboardEvent) {
        const i = ev.target as HTMLInputElement
        switch (ev.key) {
            case 'Enter': ev.preventDefault(); i.blur(); break // blur fires change. preventDefault keeps a form from submitting
            case 'Escape': i.value = this.text; i.blur(); break
            // steps commit pending text first, so they count from what was typed
            case '+':
            case 'ArrowUp': ev.preventDefault(); this.onchange(ev); this.onincrement(); i.value = this.text; break
            case '-':
            case 'ArrowDown': ev.preventDefault(); this.onchange(ev); this.ondecrement(); i.value = this.text; break
            // digits and decimal separators only. other single chars are dropped, shortcuts (ctrl, meta) and named keys pass
            default: if (ev.key.length == 1 && !ev.ctrlKey && !ev.metaKey && !/[\d.,]/.test(ev.key)) ev.preventDefault()
        }
    }

    onincrement() { this.increment(this.step) }
    ondecrement() { this.increment(-this.step) }
}
