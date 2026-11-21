import { jsx } from '../h.js'
import type { InputHTMLAttributes } from '../jsx.js'
import { Component, cc } from '../lib.js'
import './combobox.css'

type Props = Omit<InputHTMLAttributes, 'value' | 'oninput' | 'type'> & {
    items: string[]
    value: string
    setvalue: (value: string) => void
}

/**
 * a text input with a dropdown of suggestions. any text is allowed.
 * opening it (click, arrow button, ArrowDown) shows all items, typing narrows them to those containing the text.
 * open, filter and the highlighted item are the component's own state: nothing else needs them
 */
export class ComboBox extends Component<Props> {

    open = false
    filtering = false // set by typing, cleared by opening: whether the list is narrowed to the text
    active = -1 // index in shown of the highlighted item

    get shown() {
        const { items, value } = this.props
        return this.filtering ? items.filter(i => i.toLowerCase().includes(value.toLowerCase())) : items
    }

    view() {
        const { items, value, setvalue, class: cls, ...rest } = this.props
        const shown = this.shown
        return <div class={cc('jmc-combobox', cls)}>
            <input type='text' {...rest} value={value} role='combobox' aria-expanded={this.open} aria-autocomplete='list' autocomplete='off'
                oninput={this.oninput} onkeydown={this.onkeydown} onmousedown={this.openall} onblur={this.close} />
            <button type='button' tabindex={-1} disabled={rest.disabled} onmousedown={this.toggle}>&#9662;</button>
            {this.open && shown.length > 0 && <ul role='listbox' onmousedown={this.keepfocus}>
                {shown.map((s, i) => <li role='option' aria-selected={s == value} class={cc({ active: i == this.active, selected: s == value })} onmousedown={() => this.pick(s)}>{s}</li>)}
            </ul>}
        </div>
    }

    // the dropdown must not take the focus from the input, or the blur would close it before a click lands
    keepfocus(ev: Event) { ev.preventDefault() }

    openall() {
        this.open = true
        this.filtering = false
        this.active = -1
        this.updateview()
    }

    toggle(ev: Event) {
        ev.preventDefault() // keeps the focus where it is
        if (this.open) return this.close()
        this.input.focus()
        this.openall()
    }

    close() {
        this.open = false
        this.updateview()
    }

    pick(s: string) {
        this.props.setvalue(s)
        this.close()
    }

    oninput(ev: Event) {
        this.open = true
        this.filtering = true
        this.active = -1
        this.props.setvalue((ev.target as HTMLInputElement).value)
        this.updateview()
    }

    onkeydown(ev: KeyboardEvent) {
        const n = this.shown.length
        switch (ev.key) {
            case 'ArrowDown':
            case 'ArrowUp': {
                ev.preventDefault()
                if (!this.open) return this.openall()
                const step = ev.key == 'ArrowDown' ? 1 : -1
                this.active = n == 0 ? -1 : (this.active + step + n) % n
                this.updateview()
                this.element.querySelector('.active')?.scrollIntoView?.({ block: 'nearest' })
                break
            }
            case 'Enter':
                if (this.open && this.active >= 0) { ev.preventDefault(); this.pick(this.shown[this.active]) }
                else if (this.open) this.close()
                break
            case 'Escape':
                if (this.open) { ev.preventDefault(); this.close() }
                break
        }
    }

    get input() { return this.element.querySelector('input')! }
}
