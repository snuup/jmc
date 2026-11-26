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

/** a number input with minus and plus buttons. holding a button repeats its step */
export class NumberStepper extends Component<Props> {

    view() {
        const { disabled, class: cls } = this.props
        return <div class={cc('jmc-stepper', { disabled }, cls)}>
            {this.button(-1, '−')}
            <input type='text' disabled={disabled} value={this.text} onchange={this.onchange} onkeydown={this.onkeydown} />
            {this.button(1, '+')}
        </div>
    }

    // the first step on press, the repeats from the css animation that runs while the button is held (:active).
    // a click from the mouse comes after the press and must not step again. a click from the keyboard has detail 0
    button(sign: number, label: string) {
        const step = () => !this.props.disabled && this.press(sign * this.step) // pointer events still reach a disabled button
        return <button type='button' disabled={this.props.disabled}
            onpointerdown={(ev: PointerEvent) => ev.button == 0 && step()}
            onanimationiteration={step}
            onclick={(ev: MouseEvent) => ev.detail == 0 && step()}>{label}</button>
    }

    get step() { return this.props.step ?? 1 }
    get decimals() { return this.props.decimals ?? decimalsof(this.step) }
    get text() { return this.props.value.toFixed(this.decimals) }
    get input() { return this.element.querySelector('input')! }

    // setvalue only for a new value, so a button held at min or max doesn't call it again and again
    set(v: number) { if (v != this.props.value) this.props.setvalue(v) }

    // min and max bound the buttons only while the value is inside them. typed text may leave the range,
    // and from there the buttons step freely
    increment(by: number) {
        const { value, min = -Infinity, max = Infinity } = this.props
        let v = round(value + by, this.decimals)
        if (value >= min && value <= max) v = Math.min(max, Math.max(min, v))
        this.set(v)
    }

    // a press comes before the input loses focus and commits its text, so the press commits it first and steps from there
    press(by: number) {
        this.commit(this.input)
        this.increment(by)
    }

    // invalid text reverts to the current value, valid text is taken unclamped. unedited text is left alone,
    // so a value with more decimals than shown isn't rounded by a press
    commit(i: HTMLInputElement) {
        if (i.value == this.text) return
        const v = Number(i.value.trim().replace(',', '.'))
        if (i.value.trim() && Number.isFinite(v)) this.set(round(v, this.decimals))
        i.value = this.text // jmc only writes a value when it changed, so rejected or rounded text would stay otherwise
    }

    // fires on blur and enter
    onchange(ev: Event) { this.commit(ev.target as HTMLInputElement) }

    onkeydown(ev: KeyboardEvent) {
        const i = ev.target as HTMLInputElement
        switch (ev.key) {
            case 'Enter': ev.preventDefault(); i.blur(); break // blur fires change. preventDefault keeps a form from submitting
            case 'Escape': i.value = this.text; i.blur(); break
            // steps commit pending text first, so they count from what was typed
            case '+':
            case 'ArrowUp': ev.preventDefault(); this.press(this.step); break
            case '-':
            case 'ArrowDown': ev.preventDefault(); this.press(-this.step); break
            // digits and decimal separators only. other single chars are dropped, shortcuts (ctrl, meta) and named keys pass
            default: if (ev.key.length == 1 && !ev.ctrlKey && !ev.metaKey && !/[\d.,]/.test(ev.key)) ev.preventDefault()
        }
    }
}
