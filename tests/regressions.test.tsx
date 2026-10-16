import { beforeEach, describe, expect, test } from 'vitest'
import { H, HClassComponent, JMXComp, jsx, jsxf, patch, updateview } from '../src'

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
})
