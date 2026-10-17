// const marks an island: jmc renders the element and its children once, then foreign code (a map library, an editor)
// owns the inside and jmc never interferes again
import { beforeEach, describe, expect, test } from 'vitest'
import { jsx, patch, updateview } from '../src'

beforeEach(() => {
    document.documentElement.innerHTML = '<html><body></body></html>'
})

/** simulates a library like maplibre taking over the element */
let takeover = (n: Node) => {
    let e = n as HTMLElement
    e.classList.add('lib-ready')
    e.append(Object.assign(document.createElement('canvas'), { id: 'lib-canvas' }))
}

describe('const: first render', () => {
    test('renders its children on creation', () => {
        patch(document.body, <body><div const={true}><b>ho</b></div></body>)
        expect(document.querySelector('div')!.innerHTML).toBe('<b>ho</b>')
    })

    test('mounted() sees the initial children', () => {
        let seen = ''
        patch(document.body, <body><div const={true} mounted={(n) => seen = (n as Element).innerHTML}><b>ho</b></div></body>)
        expect(seen).toBe('<b>ho</b>')
    })
})

describe('const: later updates leave the inside alone', () => {
    test('changed children in the JSX are not applied', () => {
        let t = 'a'
        const App = () => <body><div const={true}><b>{t}</b></div></body>
        patch(document.body, <App />)
        const div = document.querySelector('div')!
        div.innerHTML = '<i>owned by the library</i>'

        t = 'b'
        updateview(document.body)

        expect(div.innerHTML).toBe('<i>owned by the library</i>')
    })

    test('DOM and classes added by foreign code survive updates of the parent', () => {
        const App = () => <body><div class='map' const={true} mounted={takeover} /></body>
        patch(document.body, <App />)
        const div = document.querySelector('div')!

        updateview(document.body)

        expect(document.querySelector('div')).toBe(div)
        expect(div.className).toBe('map lib-ready')
        expect(div.querySelector('#lib-canvas')).not.toBeNull()
    })

    test('updating the island itself does not touch its inside', () => {
        const Map = () => <div class='map' const={true} mounted={takeover} />
        patch(document.body, <body><Map /></body>)
        const div = document.querySelector('div')!

        updateview(div)

        expect(div.querySelector('#lib-canvas')).not.toBeNull()
    })
})

describe('const: the island element itself survives', () => {
    test('a sibling appearing before the island does not replace it', () => {
        let error = false
        const App = () => <body>{error && <p>error</p>}<div class='map' const={true} mounted={takeover} /></body>
        patch(document.body, <App />)
        const div = document.querySelector('div')!

        error = true
        updateview(document.body)

        expect(document.querySelector('div')).toBe(div)
        expect(div.querySelector('#lib-canvas')).not.toBeNull()
    })

    test('a sibling disappearing before the island does not replace it', () => {
        let error = true
        const App = () => <body>{error && <p>error</p>}<div class='map' const={true} mounted={takeover} /></body>
        patch(document.body, <App />)
        const div = document.querySelector('div')!

        error = false
        updateview(document.body)

        expect(document.querySelector('div')).toBe(div)
        expect(div.querySelector('#lib-canvas')).not.toBeNull()
    })
})

describe('const: props of the island element', () => {
    test('changed props in the JSX are not applied, so the library keeps its classes', () => {
        let theme = 'light'
        const App = () => <body><div class={theme} const={true} mounted={takeover} /></body>
        patch(document.body, <App />)
        const div = document.querySelector('div')!

        theme = 'dark'
        updateview(document.body)

        expect(div.className).toBe('light lib-ready')
    })

    test('the update hook still runs, to pass changes on to the library', () => {
        let theme = 'light'
        let applied: string[] = []
        const App = () => <body><div const={true} update={() => { applied.push(theme) }} /></body>
        patch(document.body, <App />)

        theme = 'dark'
        updateview(document.body)

        expect(applied).toEqual(['dark'])
    })

    test('the const attribute stays visible in the DOM', () => {
        patch(document.body, <body><div const={true} /></body>)
        expect(document.body.innerHTML).toBe('<div const="true"></div>')
    })
})
