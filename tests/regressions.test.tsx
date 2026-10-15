import { beforeEach, describe, expect, it } from 'vitest'
import { H, HClassComponent, JMXComp, jsx, jsxf, patch, updateview } from '../src'

beforeEach(() => {
    document.documentElement.innerHTML = '<html><body></body></html>'
})

describe('jmc regressions', () => {
    it('keeps a class component element current when its root tag changes', () => {
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

    it('updates a function component through its first root when it returns a fragment', () => {
        let name = 'before'

        const FragmentComponent = () => <>
            <b>{name}</b>
            <i>constant sibling</i>
        </>

        patch(document.body, <body><FragmentComponent /></body>)

        name = 'after'
        updateview(document.querySelector('b')!)

        expect(document.body.outerHTML).toBe(
            '<body><b>after</b><i>constant sibling</i></body>',
        )
    })

    it('removes an old rendered-root property from a function component', () => {
        let showTitle = true

        const Component = () => showTitle
            ? <div title="present" />
            : <div />

        patch(document.body, <body><Component /></body>)

        const root = document.querySelector('div')!
        expect(root.title).toBe('present')

        showTitle = false
        updateview(root)

        expect(root.hasAttribute('title')).toBe(false)
        expect(root.title).toBe('')
    })

    it('removes an attribute when its new JSX value is undefined', () => {
        let label: string | undefined = 'present'
        const App = () => <body><div aria-label={label} /></body>

        patch(document.body, <App />)
        expect(document.querySelector('div')!.getAttribute('aria-label')).toBe('present')

        label = undefined
        updateview(document.body)

        expect(document.querySelector('div')!.hasAttribute('aria-label')).toBe(false)
    })
})
