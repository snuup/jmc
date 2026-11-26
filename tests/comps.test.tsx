import { beforeEach, describe, expect, it, vi } from 'vitest'
import { jsx, patch, updateview } from '../src'
import { Checkbox, ComboBox, DataListInput, Icon, NumberStepper, RadioGroup, RangeSlider, Select, Tabs, TextArea, ToggleGroup } from '../src/comps'

beforeEach(() => {
    document.documentElement.innerHTML = '<html><body></body></html>'
})

describe('NumberStepper', () => {

    const setup = (props: Partial<ConstructorParameters<typeof NumberStepper>[0]> = {}) => {
        const m = { v: 5 }
        const setvalue = vi.fn((x: number) => { m.v = x; updateview() })
        const App = () => <NumberStepper value={m.v} setvalue={setvalue} {...props} />
        patch(document.body, <body><App /></body>)
        const input = document.querySelector('input')!
        const [minus, plus] = [...document.querySelectorAll('button')]
        return { m, setvalue, input, minus, plus }
    }

    it('shows the value and steps by 1 by default', () => {
        const { m, input, minus, plus } = setup()
        expect(input.value).toBe('5')
        plus.click()
        expect(m.v).toBe(6)
        expect(input.value).toBe('6')
        minus.click(); minus.click()
        expect(m.v).toBe(4)
    })

    it('rounds float noise by the decimals of step', () => {
        const { m, input, plus } = setup({ step: 0.1 })
        m.v = 0.2; updateview()
        plus.click()
        expect(m.v).toBe(0.3)
        expect(input.value).toBe('0.3')
    })

    it('clamps the buttons, typed text may leave the range', () => {
        const { m, input, plus, minus } = setup({ min: 0, max: 10 })
        input.value = '12'
        input.dispatchEvent(new Event('change'))
        expect(m.v).toBe(12)
        minus.click() // outside the range: steps freely
        expect(m.v).toBe(11)
        m.v = 10; updateview()
        plus.click() // inside: clamped
        expect(m.v).toBe(10)
    })

    it('takes a comma as decimal separator and reverts invalid text', () => {
        const { m, input } = setup({ decimals: 2 })
        input.value = '2,5'
        input.dispatchEvent(new Event('change'))
        expect(m.v).toBe(2.5)
        expect(input.value).toBe('2.50')
        input.value = 'abc'
        input.dispatchEvent(new Event('change'))
        expect(m.v).toBe(2.5)
        expect(input.value).toBe('2.50')
    })

    it('steps once per press: on pointerdown, not again on the mouse click after it', () => {
        const { m, plus } = setup()
        plus.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }))
        expect(m.v).toBe(6)
        plus.dispatchEvent(new MouseEvent('click', { detail: 1 }))
        expect(m.v).toBe(6)
        plus.dispatchEvent(new MouseEvent('pointerdown', { button: 2 })) // right button
        expect(m.v).toBe(6)
    })

    it('repeats while held: each animationiteration steps', () => {
        const { m, minus } = setup()
        minus.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }))
        minus.dispatchEvent(new Event('animationiteration'))
        minus.dispatchEvent(new Event('animationiteration'))
        expect(m.v).toBe(2)
    })

    it('a disabled stepper does not step on press', () => {
        const { m, plus } = setup({ disabled: true })
        plus.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }))
        plus.dispatchEvent(new Event('animationiteration'))
        expect(m.v).toBe(5)
    })

    it('calls setvalue only for a new value', () => {
        const { setvalue, plus } = setup({ max: 5 })
        plus.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }))
        plus.dispatchEvent(new Event('animationiteration'))
        expect(setvalue).not.toHaveBeenCalled()
    })

    it('a press commits typed text first and steps from it', () => {
        const { m, input, plus } = setup()
        input.value = '20'
        plus.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }))
        expect(m.v).toBe(21)
        expect(input.value).toBe('21')
        input.dispatchEvent(new Event('change')) // the blur after the press commits nothing more
        expect(m.v).toBe(21)
    })

    it('a press does not round a value with more decimals than shown', () => {
        const { m, plus } = setup({ step: 0.01 })
        m.v = 0.123; updateview()
        plus.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }))
        expect(m.v).toBe(0.13)
    })

    it('steps with the arrow keys and drops other characters', () => {
        const { m, input } = setup()
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }))
        expect(m.v).toBe(6)
        const x = new KeyboardEvent('keydown', { key: 'x', cancelable: true })
        input.dispatchEvent(x)
        expect(x.defaultPrevented).toBe(true)
    })
})

describe('TextArea', () => {

    // happy-dom has no layout: fake the sizes
    const layout = (t: HTMLTextAreaElement, scrollHeight: number) => {
        Object.defineProperty(t, 'clientHeight', { configurable: true, get: () => 20 })
        Object.defineProperty(t, 'offsetHeight', { configurable: true, get: () => 22 })
        Object.defineProperty(t, 'scrollHeight', { configurable: true, get: () => scrollHeight })
    }

    it('renders value, passes props through and merges the class', () => {
        patch(document.body, <body><TextArea value='hi' setvalue={() => { }} placeholder='p' class='x' /></body>)
        const t = document.querySelector('textarea')!
        expect(t.value).toBe('hi')
        expect(t.placeholder).toBe('p')
        expect(t.className).toBe('jmc-textarea x')
        expect(t.getAttribute('rows')).toBe('1')
    })

    it('hands out the value and grows on input', () => {
        const setvalue = vi.fn()
        patch(document.body, <body><TextArea value='' setvalue={setvalue} /></body>)
        const t = document.querySelector('textarea')!
        layout(t, 60)
        t.value = 'a\nb\nc'
        t.dispatchEvent(new Event('input'))
        expect(setvalue).toHaveBeenCalledWith('a\nb\nc')
        expect(t.style.height).toBe('62px') // scrollHeight plus 2px borders
    })

    it('adjusts the height after the model changed the value', async () => {
        const m = { text: 'one' }
        const App = () => <TextArea value={m.text} />
        patch(document.body, <body><App /></body>)
        const t = document.querySelector('textarea')!
        layout(t, 80)
        m.text = 'one\ntwo\nthree\nfour'
        updateview()
        await Promise.resolve()
        expect(t.value).toBe(m.text)
        expect(t.style.height).toBe('82px')
    })

    it('does not touch the height while hidden', () => {
        patch(document.body, <body><TextArea value='' /></body>)
        const t = document.querySelector('textarea')!
        t.dispatchEvent(new Event('input')) // clientHeight is 0 here
        expect(t.style.height).toBe('')
    })
})

describe('RangeSlider', () => {

    it('shows the value and hands out numbers while dragging', () => {
        const m = { v: 3 }
        const App = () => <RangeSlider value={m.v} setvalue={x => { m.v = x; updateview() }} min={0} max={10} step={1} class='x' />
        patch(document.body, <body><App /></body>)
        const i = document.querySelector('input')!
        expect(i.type).toBe('range')
        expect(i.className).toBe('jmc-range-slider x')
        expect(i.value).toBe('3')
        i.value = '7'
        i.dispatchEvent(new Event('input'))
        expect(m.v).toBe(7)
        expect(i.value).toBe('7')
    })
})

describe('Select', () => {

    const items = [{ name: 'a' }, { name: 'b' }, { name: 'c' }]

    it('selects the item of value and hands out items, not text', async () => {
        const m = { v: items[1] as (typeof items)[number] | undefined }
        const App = () => <Select items={items} value={m.v} label={i => i.name.toUpperCase()} setvalue={x => { m.v = x; updateview() }} />
        patch(document.body, <body><App /></body>)
        const s = document.querySelector('select')!
        expect([...s.options].map(o => o.text)).toEqual(['A', 'B', 'C'])
        expect(s.selectedIndex).toBe(1)

        s.selectedIndex = 2
        s.dispatchEvent(new Event('change'))
        expect(m.v).toBe(items[2]) // the object itself
        await Promise.resolve()
        expect(s.selectedIndex).toBe(2)
    })

    it('follows the model and shows nothing selected for an unknown value', async () => {
        const m = { v: items[0] as (typeof items)[number] | undefined }
        const App = () => <Select items={items} value={m.v} setvalue={() => { }} disabled />
        patch(document.body, <body><App /></body>)
        const s = document.querySelector('select')!
        expect(s.disabled).toBe(true)
        m.v = items[2]; updateview()
        await Promise.resolve()
        expect(s.selectedIndex).toBe(2)
        m.v = undefined; updateview()
        await Promise.resolve()
        expect(s.selectedIndex).toBe(-1)
    })
})

describe('ComboBox', () => {

    const items = ['hase', 'ente', 'fuchs', 'hund']

    const setup = () => {
        const m = { v: '' }
        const App = () => <ComboBox items={items} value={m.v} setvalue={x => { m.v = x; updateview() }} placeholder='p' />
        patch(document.body, <body><App /></body>)
        const input = document.querySelector('input')!
        const options = () => [...document.querySelectorAll('li')].map(li => li.textContent)
        const key = (k: string) => input.dispatchEvent(new KeyboardEvent('keydown', { key: k, cancelable: true }))
        const type = (text: string) => { input.value = text; input.dispatchEvent(new Event('input')) }
        return { m, input, options, key, type }
    }

    it('is closed first, and opens with all items on click, even when the text matches one', () => {
        const { m, input, options } = setup()
        expect(options()).toEqual([])
        expect(input.placeholder).toBe('p')
        m.v = 'hase'; updateview()
        input.dispatchEvent(new MouseEvent('mousedown'))
        expect(options()).toEqual(items) // not only the one that matches
        expect(input.getAttribute('aria-expanded')).toBe('true')
    })

    it('opens with the arrow button, and the button closes it again', () => {
        setup()
        const button = document.querySelector('button')!
        button.dispatchEvent(new MouseEvent('mousedown', { cancelable: true }))
        expect(document.querySelectorAll('li').length).toBe(4)
        button.dispatchEvent(new MouseEvent('mousedown', { cancelable: true }))
        expect(document.querySelectorAll('li').length).toBe(0)
    })

    it('narrows the list while typing and hands out the text, also when nothing matches', () => {
        const { m, options, type } = setup()
        type('h')
        expect(m.v).toBe('h')
        expect(options()).toEqual(['hase', 'fuchs', 'hund']) // contains, not starts with
        type('hu')
        expect(options()).toEqual(['hund'])
        type('xyz')
        expect(m.v).toBe('xyz') // free text
        expect(options()).toEqual([]) // no empty box
    })

    it('picks with the mouse', () => {
        const { m, input, options } = setup()
        input.dispatchEvent(new MouseEvent('mousedown'))
        document.querySelectorAll('li')[2].dispatchEvent(new MouseEvent('mousedown', { cancelable: true }))
        expect(m.v).toBe('fuchs')
        expect(input.value).toBe('fuchs')
        expect(options()).toEqual([]) // closed
    })

    it('picks with the keyboard: arrows highlight, enter picks, escape closes, enter without highlight keeps the text', () => {
        const { m, input, options, key, type } = setup()
        key('ArrowDown') // opens
        expect(options()).toEqual(items)
        key('ArrowDown'); key('ArrowDown')
        expect(document.querySelector('li.active')!.textContent).toBe('ente')
        key('ArrowUp'); key('ArrowUp') // wraps
        expect(document.querySelector('li.active')!.textContent).toBe('hund')
        key('Enter')
        expect(m.v).toBe('hund')
        expect(options()).toEqual([])

        key('ArrowDown')
        key('Escape')
        expect(options()).toEqual([])
        type('hu')
        key('Enter') // nothing highlighted
        expect(m.v).toBe('hu')
        expect(input.value).toBe('hu')
        expect(options()).toEqual([])
    })

    it('closes on blur', () => {
        const { input, options } = setup()
        input.dispatchEvent(new MouseEvent('mousedown'))
        input.dispatchEvent(new Event('blur'))
        expect(options()).toEqual([])
    })
})

describe('Checkbox', () => {

    const setup = (initial: boolean | 'mixed', accept = true) => {
        const m = { v: initial }
        const setchecked = vi.fn((x: boolean) => { if (accept) { m.v = x; updateview() } })
        const App = () => <Checkbox checked={m.v} setchecked={setchecked} round class='x' style='--jmc-accent:red'>all</Checkbox>
        patch(document.body, <body><App /></body>)
        return { m, setchecked, input: document.querySelector('input')!, label: document.querySelector('label')! }
    }

    it('renders the three states and the label text, class and style on the label', () => {
        const { m, input, label } = setup(false)
        expect(label.className).toBe('jmc-checkbox jmc-round x')
        expect(label.getAttribute('style')).toContain('--jmc-accent')
        expect(label.textContent).toBe('all')
        expect([input.checked, input.indeterminate]).toEqual([false, false])
        m.v = true; updateview()
        expect([input.checked, input.indeterminate]).toEqual([true, false])
        m.v = 'mixed'; updateview()
        expect([input.checked, input.indeterminate]).toEqual([false, true])
    })

    it('hands out true on a click on mixed, and false on a click on checked', () => {
        const { m, setchecked, input } = setup('mixed')
        input.click()
        expect(setchecked).toHaveBeenLastCalledWith(true)
        expect(m.v).toBe(true)
        input.click()
        expect(setchecked).toHaveBeenLastCalledWith(false)
    })

    it('shows what the model decided when it refuses the change', () => {
        const { input } = setup('mixed', false)
        input.click()
        expect([input.checked, input.indeterminate]).toEqual([false, true])
    })
})

describe('ToggleGroup, Tabs', () => {

    it('ToggleGroup selects the item of value and hands out items', () => {
        const m = { v: 2 as number | undefined }
        const App = () => <ToggleGroup items={[1, 2, 3]} value={m.v} setvalue={x => { m.v = x; updateview() }} label={i => `#${i}`} />
        patch(document.body, <body><App /></body>)
        const buttons = [...document.querySelectorAll('button')]
        expect(buttons.map(b => b.textContent)).toEqual(['#1', '#2', '#3'])
        expect(buttons.map(b => b.className)).toEqual(['', 'selected', ''])
        expect(buttons.map(b => b.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false'])
        buttons[2].click()
        expect(m.v).toBe(3)
        expect(document.querySelector('.selected')!.textContent).toBe('#3')
        m.v = undefined; updateview()
        expect(document.querySelector('.selected')).toBe(null)
    })

    it('ToggleGroup disables its buttons', () => {
        patch(document.body, <body><ToggleGroup items={['a']} value='a' setvalue={() => { }} disabled /></body>)
        expect(document.querySelector('button')!.disabled).toBe(true)
    })

    it('Tabs are tabs, and the selected one is marked', () => {
        const m = { v: 'b' }
        const App = () => <Tabs items={['a', 'b']} value={m.v} setvalue={x => { m.v = x; updateview() }} />
        patch(document.body, <body><App /></body>)
        const tabs = [...document.querySelectorAll<HTMLElement>('[role=tab]')]
        expect(tabs.map(t => t.getAttribute('aria-selected'))).toEqual(['false', 'true'])
        tabs[0].click()
        expect(m.v).toBe('a')
        expect(document.querySelector('.selected')!.textContent).toBe('a')
    })
})

describe('RadioGroup', () => {

    const items = ['a', 'b', 'c']

    it('renders radios with one group name and a color, and hands out items', () => {
        const m = { v: 'b' as string | undefined }
        const App = () => <RadioGroup items={items} value={m.v} setvalue={x => { m.v = x; updateview() }} color={i => i == 'a' ? 'red' : undefined} />
        patch(document.body, <body><App /><RadioGroup items={items} value='a' setvalue={() => { }} /></body>)
        const [first, second] = [...document.querySelectorAll('.jmc-radio-group')]
        const radios = [...first.querySelectorAll('input')]
        expect(new Set(radios.map(r => r.name)).size).toBe(1)
        expect(radios.map(r => r.checked)).toEqual([false, true, false])
        expect(radios[0].getAttribute('style')).toContain('accent-color:red')
        expect(second.querySelector('input')!.name).not.toBe(radios[0].name)

        radios[2].checked = true
        radios[2].dispatchEvent(new Event('change'))
        expect(m.v).toBe('c')
    })

    it('shows what the model decided when it refuses the change', () => {
        patch(document.body, <body><RadioGroup items={items} value='b' setvalue={() => { }} /></body>)
        const radios = [...document.querySelectorAll('input')]
        radios[2].checked = true
        radios[2].dispatchEvent(new Event('change'))
        expect(radios.map(r => r.checked)).toEqual([false, true, false])
    })
})

describe('Icon', () => {

    it('draws a lucide icon node as svg', () => {
        const node = [['path', { d: 'M0 0' }], ['circle', { cx: 12, cy: 12, r: 3 }]] as any
        patch(document.body, <body><Icon icon={node} size={24} stroke={1.5} class='x' /></body>)
        const svg = document.querySelector('svg')!
        expect(svg.getAttribute('class')).toBe('jmc-icon x')
        expect(svg.getAttribute('width')).toBe('24')
        expect(svg.getAttribute('stroke-width')).toBe('1.5')
        expect(svg.getAttribute('stroke')).toBe('currentColor')
        expect(svg.querySelector('path')!.getAttribute('d')).toBe('M0 0')
        expect(svg.querySelector('circle')!.getAttribute('r')).toBe('3')
        expect(svg.querySelector('path')!.namespaceURI).toBe('http://www.w3.org/2000/svg')
    })
})

describe('disabled', () => {

    it('disables the stepper and the slider', () => {
        patch(document.body, <body><NumberStepper value={1} setvalue={() => { }} disabled /><RangeSlider value={1} setvalue={() => { }} disabled /></body>)
        expect([...document.querySelectorAll('button, input')].map(e => (e as HTMLInputElement).disabled)).toEqual([true, true, true, true])
        expect(document.querySelector('.jmc-stepper')!.classList.contains('disabled')).toBe(true)
    })
})

describe('DataListInput', () => {

    it('connects the input to its datalist, with unique ids per instance', () => {
        patch(document.body, <body><DataListInput items={['hase', 'ente']} value='' setvalue={() => { }} placeholder='p' /><DataListInput items={[]} value='' setvalue={() => { }} /></body>)
        const [a, b] = [...document.querySelectorAll('.jmc-datalist-input')]
        const input = a.querySelector('input')!
        const list = a.querySelector('datalist')!
        expect(input.getAttribute('list')).toBe(list.id)
        expect(input.placeholder).toBe('p')
        expect([...list.querySelectorAll('option')].map(o => o.getAttribute('value'))).toEqual(['hase', 'ente'])
        expect(b.querySelector('datalist')!.id).not.toBe(list.id)
    })

    it('hands out the text and shows the value', () => {
        const m = { v: 'x' }
        const App = () => <DataListInput items={['hase']} value={m.v} setvalue={x => { m.v = x; updateview() }} />
        patch(document.body, <body><App /></body>)
        const input = document.querySelector('input')!
        expect(input.value).toBe('x')
        input.value = 'fuchs'
        input.dispatchEvent(new Event('input'))
        expect(m.v).toBe('fuchs')
    })
})
