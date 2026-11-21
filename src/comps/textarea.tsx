import { jsx } from '../h.js'
import type { TextareaHTMLAttributes } from '../jsx.js'
import { Component, cc } from '../lib.js'
import './textarea.css'

type Props = Omit<TextareaHTMLAttributes, 'value' | 'oninput'> & {
    value: string
    setvalue?: (value: string) => void
}

/** a textarea that grows and shrinks with its text */
export class TextArea extends Component<Props> {

    view() {
        const { value, setvalue, class: cls, ...rest } = this.props
        return <textarea rows={1} {...rest} class={cc('jmc-textarea', cls)} value={value} oninput={this.oninput} />
    }

    mounted() {
        // fires once the element has a size: when mounted, when shown after being hidden, and when its width changes (the text wraps anew)
        new ResizeObserver(this.adjust).observe(this.element)
        if (this.props.autofocus) this.element.focus()
    }

    // runs before the render. the new value is set by then, so the height is adjusted after it
    update() {
        queueMicrotask(this.adjust)
    }

    oninput(ev: Event) {
        this.props.setvalue?.((ev.target as HTMLTextAreaElement).value)
        this.adjust()
    }

    adjust() {
        const t = this.element as HTMLTextAreaElement
        if (!t.clientHeight) return // hidden. the observer calls again when it is shown
        t.style.height = 'auto' // so it shrinks too: scrollHeight is never below the current height
        t.style.height = t.scrollHeight + t.offsetHeight - t.clientHeight + 'px' // plus the borders
    }
}
