import { jsx } from '../h.js'
import { Component, cc } from '../lib.js'
import './tabs.css'

type Props<T> = {
    items: T[]
    value: T | undefined
    setvalue: (item: T) => void
    label?: (item: T) => any // default: String(item)
    class?: string
}

/** the tab bar only: the content below it belongs to the app, which shows what the selected tab says */
export class Tabs<T = any> extends Component<Props<T>> {

    view() {
        const { items, value, setvalue, label = String, class: cls } = this.props
        return <nav role='tablist' class={cc('jmc-tabs', cls)}>
            {items.map(i => <button type='button' role='tab' aria-selected={i === value} class={cc({ selected: i === value })} onclick={() => setvalue(i)}>{label(i)}</button>)}
        </nav>
    }
}
