import { beforeEach, describe, expect, test } from 'vitest'
import { H, HClassComponent, JMXComp, jsx, jsxf, patch, updateview, lazy } from '../src'

beforeEach(() => {
    document.documentElement.innerHTML = '<html><body></body></html>'
})

describe('jmc regressions', () => {
    test('a class component element follows its root when the root tag changes', () => {
        let renderSpan = false

        class RootSwitcher extends JMXComp {
            view(): H {
                return renderSpan ? <span>component</span> : <div>component</div>
            }
        }

        patch(document.body, <body><RootSwitcher /></body>)

        const initialRoot = document.querySelector('div')!
        const component = (initialRoot.h as HClassComponent).i! as RootSwitcher

        renderSpan = true
        component.updateview()

        const replacementRoot = document.querySelector('span')!
        expect(component.element).toBe(replacementRoot)
        expect(component.element.isConnected).toBe(true)
    })

    test('a fragment-returning function component is updated only via its parent', () => {
        let name = 'before'

        const FragmentComponent = () => <>
            <b>{name}</b>
            <i>constant sibling</i>
        </>

        patch(document.body, <body><FragmentComponent /></body>)

        // the fragment component is not attached to its first node, so it cannot update itself
        expect(document.querySelector('b')!.h?.kind).toBe(1)

        name = 'after'
        updateview(document.body)

        expect(document.body.outerHTML).toBe(
            '<body><b>after</b><i>constant sibling</i></body>',
        )
    })

    test('a fragment returned by a function component grows and shrinks when its parent is updated', () => {
        let n = 1
        const Items = () => <>{Array.from({ length: n }, (_, k) => <b>{k}</b>)}</>

        patch(document.body, <body><Items /><hr /></body>)

        n = 3
        updateview(document.body)
        expect(document.body.innerHTML).toBe('<b>0</b><b>1</b><b>2</b><hr>')

        n = 1
        updateview(document.body)
        expect(document.body.innerHTML).toBe('<b>0</b><hr>')
    })

    test('a class component whose view returns a fragment throws', () => {
        class FragmentClass extends JMXComp {
            view(): H {
                return <><b>a</b><i>b</i></>
            }
        }
        expect(() => patch(document.body, <body><FragmentClass /></body>)).toThrow(
            'FragmentClass.view() must render exactly one root element',
        )
    })

    test('a class component whose view returns a single-child fragment throws', () => {
        class SingleFragmentClass extends JMXComp {
            view(): H {
                return <><b>a</b></>
            }
        }
        expect(() => patch(document.body, <body><SingleFragmentClass /></body>)).toThrow(
            'SingleFragmentClass.view() must render exactly one root element',
        )
    })

    test('a class component whose view switches to a fragment throws on update', () => {
        let fragment = false
        class Switcher extends JMXComp {
            view(): H {
                return fragment ? <><b>a</b><i>b</i></> : <div>a</div>
            }
        }
        patch(document.body, <body><Switcher /></body>)
        const component = (document.querySelector('div')!.h as HClassComponent).i! as Switcher

        fragment = true
        expect(() => component.updateview()).toThrow(
            'Switcher.view() must render exactly one root element',
        )
    })

    test('a property dropped from the root element of a function component is removed', () => {
        let showTitle = true

        let C = () => showTitle
            ? <div title="present" />
            : <div />

        patch(document.body, <body><C /></body>)

        const root = document.querySelector('div')!
        expect(root.title).toBe('present')

        showTitle = false
        updateview(root)

        expect(root.hasAttribute('title')).toBe(false)
        expect(root.title).toBe('')
    })

    test('an attribute whose new value is undefined is removed', () => {
        let label: string | undefined = 'present'
        const App = () => <body><div aria-label={label} /></body>

        patch(document.body, <App />)
        expect(document.querySelector('div')!.getAttribute('aria-label')).toBe('present')

        label = undefined
        updateview(document.body)

        expect(document.querySelector('div')!.hasAttribute('aria-label')).toBe(false)
    })

    test('a dropped thunked attribute is removed', () => {
        let showClass = true
        const App = () => <body>{showClass ? <div class={lazy(() => 'a')} /> : <div />}</body>

        patch(document.body, <App />)
        expect(document.querySelector('div')!.getAttribute('class')).toBe('a')

        showClass = false
        updateview(document.body)

        expect(document.querySelector('div')!.hasAttribute('class')).toBe(false)
    })

    test('a thunked attribute evaluating to undefined is removed', () => {
        let css: string | undefined = 'a'
        const App = () => <body><div class={lazy(() => css)} /></body>

        patch(document.body, <App />)
        expect(document.querySelector('div')!.getAttribute('class')).toBe('a')

        css = undefined
        updateview(document.body)

        expect(document.querySelector('div')!.hasAttribute('class')).toBe(false)
    })

    // issue 1: setprops compares with != so loosely equal values are taken as unchanged
    test('a change between loosely equal values is applied', () => {
        let title: any = 0
        let data: any = 1
        const App = () => <body><div title={title} data-x={data} /></body>

        patch(document.body, <App />)
        const div = document.querySelector('div')!
        expect(div.title).toBe('0')
        expect(div.getAttribute('data-x')).toBe('1')

        title = '' // 0 == ''
        data = true // 1 == true
        updateview(document.body)

        expect(div.title).toBe('')
        expect(div.getAttribute('data-x')).toBe('true')
    })

    // issue 2: querySelectorAll collects all matches before patching, so patching an outer match can replace an inner one
    test('updateview by selector skips a match that patching an earlier match replaced', () => {
        let asdiv = false
        const Card = () => <section class="card">{asdiv ? <div class="card" /> : <section class="card" />}</section>
        patch(document.body, <body><Card /></body>)

        asdiv = true
        expect(() => updateview('.card')).not.toThrow()
        expect(document.body.innerHTML).toBe('<section class="card"><div class="card"></div></section>')
    })

    // issue 3: jsx leaves h.p undefined when no props are given
    test('a component rendered without props receives an empty props object', () => {
        const F = ({ x }: { x?: string }) => <i>{x ?? 'none'}</i>
        class C extends JMXComp<{ x?: string }> {
            view(): H { return <b>{this.props.x ?? 'none'}</b> }
        }

        const App = () => <body><F /><C /></body>

        patch(document.body, <App />) // create
        expect(document.body.innerHTML).toBe('<i>none</i><b>none</b>')

        updateview(document.body) // update: C's instance is reused and gets new props
        expect(document.body.innerHTML).toBe('<i>none</i><b>none</b>')
    })

    // issue 4: an element whose update() returns true skips process(), so n.h keeps the previous H
    test('an element whose update() handles the update still gets the new H attached', () => {
        let v = 1
        const F = (p: { v: number }) => <div update={() => true} title={String(p.v)} />
        const App = () => <body><F v={v} /></body>

        patch(document.body, <App />)
        const div = document.querySelector('div')!

        v = 2
        updateview(document.body)

        expect((div.h as any).p.v).toBe(2)
    })
})
