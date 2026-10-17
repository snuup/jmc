// candidate tests, to be picked from and moved into the suites
// test.fails marks a known open issue: the test passes while the issue exists and starts failing once it is fixed
import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
    H, Component, jsx, jsxf, patch, updateview, lazy, cc, When, rebind, closestby, mount,
    loggedmethods, loggedmethodsex, updateviewmicro, updateviewsync,
} from '../src'

beforeEach(() => {
    document.documentElement.innerHTML = '<html><body></body></html>'
})

describe('element reuse and H attachment', () => {
    test('a re-rendered parent reuses the child element and attaches the new H', () => {
        let v = 1
        const App = () => <body><div title={String(v)} /></body>
        patch(document.body, <App />)
        const div = document.querySelector('div')!
        const h1 = div.h

        v = 2
        updateview(document.body)

        expect(document.querySelector('div')).toBe(div) // same element
        expect(div.h).not.toBe(h1) // new H
        expect(div.title).toBe('2')
    })

    test('updateview on a node re-patches with the H it already holds', () => {
        const F = () => <div />
        patch(document.body, <body><F /></body>)
        const div = document.querySelector('div')!
        const h = div.h

        updateview(div)

        expect(div.h).toBe(h)
    })

    test('a text node is updated in place, not replaced', () => {
        let v = 'a'
        const App = () => <body><p>{v}</p></body>
        patch(document.body, <App />)
        const p = document.querySelector('p')!
        const text = p.firstChild

        v = 'b'
        updateview(document.body)

        expect(p.firstChild).toBe(text)
        expect(text!.textContent).toBe('b')
    })

    test('jmc does not render children into web components', () => {
        patch(document.body, jsx('body', null, jsx('my-el', null, jsx('b', null))))
        const el = document.querySelector('my-el')!
        expect(el.childNodes.length).toBe(0)

        el.append(document.createElement('i')) // rendered by the web component itself
        updateview(document.body)

        expect(el.innerHTML).toBe('<i></i>')
    })
})

describe('element lifecycle hooks', () => {
    test('mounted() runs once, on creation only', () => {
        let mounted = 0
        const App = () => <body><div mounted={() => mounted++} /></body>

        patch(document.body, <App />)
        updateview(document.body)
        updateview(document.body)

        expect(mounted).toBe(1)
    })

    test('update() runs on reuse only, not on creation', () => {
        let updates = 0
        const App = () => <body><div update={() => { updates++ }} /></body>

        patch(document.body, <App />)
        expect(updates).toBe(0)

        updateview(document.body)
        expect(updates).toBe(1)
    })

    test('update() sees the new props through n.h', () => {
        let v = 1
        let seen: number[] = []
        const F = (p: { v: number }) => <div update={(n: Node) => { seen.push((n.h as any).p.v); return true }} />
        const App = () => <body><F v={v} /></body>
        patch(document.body, <App />)

        v = 2
        updateview(document.body)

        expect(seen).toEqual([2])
    })

    test('update() returning true leaves props and children untouched', () => {
        let t = 'a'
        const App = () => <body><div title={t} update={() => true}><b>{t}</b></div></body>
        patch(document.body, <App />)

        t = 'b'
        updateview(document.body)

        expect(document.querySelector('div')!.title).toBe('a')
        expect(document.querySelector('b')!.textContent).toBe('a')
    })
})

describe('props', () => {
    test('aria-* attributes keep the value false', () => {
        patch(document.body, <body><div aria-hidden={false} /></body>)
        expect(document.querySelector('div')!.getAttribute('aria-hidden')).toBe('false')
    })

    test('a dropped boolean property is reset and its attribute removed', () => {
        let on = true
        const App = () => <body>{on ? <input disabled={true} /> : <input />}</body>
        patch(document.body, <App />)
        const input = document.querySelector('input')!
        expect(input.disabled).toBe(true)

        on = false
        updateview(document.body)

        expect(input.disabled).toBe(false)
        expect(input.hasAttribute('disabled')).toBe(false)
    })

    test('switching a prop between null and undefined does not touch the DOM', () => {
        let v: any = null
        const App = () => <body><div title={v} /></body>
        patch(document.body, <App />)
        const div = document.querySelector('div')!
        div.setAttribute('title', 'external')

        v = undefined
        updateview(document.body)

        expect(div.getAttribute('title')).toBe('external')
    })

    test('a dropped event handler is removed', () => {
        let on = true
        const f = () => { }
        const App = () => <body>{on ? <button onclick={f} /> : <button />}</body>
        patch(document.body, <App />)
        const button = document.querySelector('button')!
        expect(button.onclick).toBe(f)

        on = false
        updateview(document.body)

        expect(button.onclick).toBeFalsy()
    })

    test('rendering keeps the thunk in h.p, so the next render evaluates it again', () => {
        const t = lazy(() => 'a')
        const h = <div title={t} />
        patch(document.body, <body>{h}</body>)

        expect(document.querySelector('div')!.title).toBe('a')
        expect((h as any).p.title).toBe(t)
    })
})

describe('text rendering', () => {
    test('0 renders as text', () => {
        patch(document.body, <body>{0}</body>)
        expect(document.body.innerHTML).toBe('0')
    })

    test('false renders nothing, so {cond && <b />} works', () => {
        let cond = false
        const App = () => <body>{cond && <b />}<i /></body>
        patch(document.body, <App />)
        expect(document.body.innerHTML).toBe('<i></i>')

        cond = true
        updateview(document.body)
        expect(document.body.innerHTML).toBe('<b></b><i></i>')
    })

    test('a conditional child keeps its slot, so the elements after it are reused', () => {
        let error = false
        const App = () => <body>{error && <p>error</p>}<input /></body>
        patch(document.body, <App />)
        const input = document.querySelector('input')!

        error = true
        updateview(document.body)
        expect(document.querySelector('input')).toBe(input)

        error = false
        updateview(document.body)
        expect(document.querySelector('input')).toBe(input)
        expect(document.body.innerHTML).toBe('<input>') // the placeholder is an empty text node
    })

    test('true renders nothing either, so {flag || <b />} works', () => {
        patch(document.body, <body>{true || <b />}<i /></body>)
        expect(document.body.innerHTML).toBe('<i></i>')
    })

    test('a function component returning false renders nothing', () => {
        const F = () => false
        patch(document.body, <body><F /><i /></body>)
        expect(document.body.innerHTML).toBe('<i></i>')
    })
})

describe('class components', () => {
    test('a re-rendered parent reuses the instance: constructed and mounted once, props updated', () => {
        let v = 1
        let created = 0
        let mounted = 0
        class C extends Component<{ v: number }> {
            constructor(p: { v: number }) { super(p); created++ }
            mounted() { mounted++ }
            view(): H { return <i>{this.props.v}</i> }
        }
        const App = () => <body><C v={v} /></body>
        patch(document.body, <App />)

        v = 2
        updateview(document.body)

        expect(created).toBe(1)
        expect(mounted).toBe(1)
        expect(document.querySelector('i')!.textContent).toBe('2')
    })

    test('a component updates itself through this.updateview(), also when the method is called detached', () => {
        class Counter extends Component {
            n = 0
            view(): H { return <b>{this.n}</b> }
            inc() { this.n++; this.updateview() }
        }
        const h = <Counter />
        patch(document.body, <body>{h}</body>)

        const { inc } = (h as any).i as Counter // rebind makes detached calls work
        inc()

        expect(document.querySelector('b')!.textContent).toBe('1')
    })

    // known issue 5: the class H is attached to the root node, so the outer function component is lost
    test.fails('updateview on the root of a class component inside a function component re-runs the function', () => {
        let val = 'a'
        class C extends Component<{ x: string }> {
            view(): H { return <i>{this.props.x}</i> }
        }
        const F = () => <C x={val} />
        patch(document.body, <body><F /></body>)
        const root = document.querySelector('i')!

        val = 'b'
        updateview(root)

        expect(root.textContent).toBe('b')
    })
})

describe('namespaces', () => {
    // by design: entering svg is explicit. the JSX types require xmlns on <svg>, hence jsx() calls here
    test('<svg> without xmlns stays in the html namespace', () => {
        patch(document.body, jsx('body', null, jsx('svg', null, jsx('circle', null))))
        expect(document.querySelector('svg')!.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    })

    test('the children of <svg> inherit its namespace', () => {
        patch(document.body, <body><svg xmlns='http://www.w3.org/2000/svg'><circle /></svg></body>)
        expect(document.querySelector('circle')!.namespaceURI).toBe('http://www.w3.org/2000/svg')
    })
})

describe('updateview', () => {
    test('updateview() without arguments updates body', () => {
        let v = 'a'
        const App = () => <body>{v}</body>
        patch(document.body, <App />)

        v = 'b'
        updateview()

        expect(document.body.textContent).toBe('b')
    })

    test('updateview with only an update context or depth, but no target, updates body', () => {
        let seen: any[] = []
        const App = () => <body><canvas update={(n, uc) => { seen.push(uc); return true }} /></body>
        patch(document.body, <App />)

        updateview({ resized: true })
        updateview(5)

        expect(seen).toEqual([{ resized: true }, {}])
    })

    test('updateview skips a node that jmc did not render', () => {
        const div = document.createElement('div')
        document.body.append(div)
        expect(() => updateview(div)).not.toThrow()
    })
})

describe('batched updates', () => {
    test('updateviewmicro collapses the calls of one tick into one update', async () => {
        let renders = 0
        let v = 'a'
        const App = () => { renders++; return <body>{v}</body> }
        patch(document.body, <App />)
        renders = 0

        v = 'b'
        updateviewmicro(document.body)
        updateviewmicro(document.body)
        expect(renders).toBe(0) // not yet

        await Promise.resolve() // runs after the queued flush
        expect(renders).toBe(1)
        expect(document.body.textContent).toBe('b')
    })

    test('updateviewsync flushes pending batched updates immediately', async () => {
        let renders = 0
        const App = () => { renders++; return <body /> }
        patch(document.body, <App />)
        renders = 0

        updateviewmicro(document.body)
        updateviewsync()
        expect(renders).toBe(1)

        await Promise.resolve() // the queued flush finds nothing left
        expect(renders).toBe(1)
    })

    test('a node queued by selector and by reference is updated once', async () => {
        let renders = 0
        const App = () => { renders++; return <body /> }
        patch(document.body, <App />)
        renders = 0

        updateviewmicro('body')
        updateviewmicro(document.body)
        await Promise.resolve()

        expect(renders).toBe(1)
    })

    // was bug A: all queued commands ran as one updateview, so depth and uc carried over between calls
    test('the depth of one batched call does not leak into the next call', async () => {
        let v = 'a'
        const A = () => <p>{v}</p>
        const B = () => <section>{v}</section>
        patch(document.body, <body><A /><B /></body>)

        v = 'b'
        updateviewmicro(1, document.querySelector('p')!) // depth 1: props only
        updateviewmicro(document.querySelector('section')!) // full depth
        await Promise.resolve()

        expect(document.querySelector('section')!.textContent).toBe('b')
    })

    // was bug B: nothing was queued, so flush returned early
    test('updateviewmicro() without arguments updates body, like updateview()', async () => {
        let v = 'a'
        const App = () => <body>{v}</body>
        patch(document.body, <App />)

        v = 'b'
        updateviewmicro()
        await Promise.resolve()

        expect(document.body.textContent).toBe('b')
    })
})

describe('lib', () => {
    test('cc joins class names and the keys of truthy entries, skipping undefined', () => {
        expect(cc('a', undefined, { b: true, c: false, d: 1 }, 'e')).toBe('a b d e')
    })

    test('When renders its children only if cond is true', () => {
        const App = (p: { cond: boolean }) => <body><When cond={p.cond}><b /></When></body>

        patch(document.body, <App cond={true} />)
        expect(document.body.innerHTML).toBe('<b></b>')

        patch(document.body, <App cond={false} />)
        expect(document.body.innerHTML).toBe('')
    })

    test('ismounted is false before and true after rendering', () => {
        class C extends Component { view(): H { return <b /> } }
        expect(new C({}).ismounted).toBe(false)

        const h = <C />
        patch(document.body, <body>{h}</body>)
        expect(((h as any).i as C).ismounted).toBe(true)
    })
})

describe('base', () => {
    test('rebind binds prototype methods, so they work detached', () => {
        class A { x = 1; get() { return this.x } }
        const { get } = rebind(new A())
        expect(get()).toBe(1)
    })

    test('closestby finds the nearest matching ancestor, or null', () => {
        document.body.innerHTML = '<section><div><b></b></div></section>'
        const b = document.querySelector('b')!

        expect(closestby(b, (n) => n.nodeName == 'SECTION')).toBe(document.querySelector('section'))
        expect(closestby(b, (n) => n.nodeName == 'TABLE')).toBeNull()
    })

    test('lazy marks the function as thunk and returns it', () => {
        const f = () => 1
        expect(lazy(f)).toBe(f)
        expect((f as any).thunk).toBeTruthy()
    })

    test('mount puts the entries on globalThis', () => {
        mount({ __jmcprobe: 42 })
        expect((globalThis as any).__jmcprobe).toBe(42)
        delete (globalThis as any).__jmcprobe
    })

    test('loggedmethodsex logs name, args and result after the call, passing this and the result through', () => {
        const calls: any[] = []
        const o = loggedmethodsex(
            { x: 2, add(a: number) { calls.push('ran'); return this.x + a } },
            (name, args, result) => calls.push([name, args, result]))

        expect(o.add(3)).toBe(5)
        expect(o.x).toBe(2) // non-functions pass through unwrapped
        expect(calls).toEqual(['ran', ['add', [3], 5]])
    })

    test('loggedmethods prints name, args and result to the console', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => { })
        loggedmethods({ add(a: number, b: number) { return a + b } }).add(1, 2)

        expect(log).toHaveBeenCalledWith('%cadd', expect.stringContaining('background:#585059'), [1, 2], 3)
        log.mockRestore()
    })

    test('loggedmethodsex logs nested calls inner first', () => {
        const names: string[] = []
        const o = loggedmethodsex({ a(): number { return this.b() + 1 }, b() { return 1 } }, (name) => names.push(name))

        o.a()

        expect(names).toEqual(['b', 'a'])
    })

    // intended: a failing action shall surface loudly, not be logged as if it completed
    test('loggedmethodsex does not log a call that throws', () => {
        const logger = vi.fn()
        const o = loggedmethodsex({ fail() { throw new Error('x') } }, logger)

        expect(() => o.fail()).toThrow('x')
        expect(logger).not.toHaveBeenCalled()
    })
})
