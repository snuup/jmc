import { beforeEach, describe, expect, test } from 'vitest'
import { H, Component, jsx, patch, updateview } from '../src'

beforeEach(() => {
    document.documentElement.innerHTML = '<html><body></body></html>'
})

describe('lifecycle callback order', () => {
    test('mounted() runs after the whole render: an inner element sees its parent finished and in the document', () => {
        let seen = ''
        patch(document.body, <body><div><b mounted={(n) => seen = `${n.isConnected} ${n.parentElement!.innerHTML}`} /><i /></div></body>)

        expect(seen).toBe('true <b></b><i></i>')
    })

    test('mounted() runs children before parents, in document order', () => {
        const log: string[] = []
        const m = (name: string) => () => log.push(name)
        patch(document.body, <body><div mounted={m('div')}><b mounted={m('b')} /><i mounted={m('i')}><s mounted={m('s')} /></i></div></body>)

        expect(log).toEqual(['b', 's', 'i', 'div'])
    })

    test('mounted() inside a class component sees the component element assigned', () => {
        let seen: Node | undefined
        class C extends Component {
            view(): H { return <section><b mounted={() => seen = this.element} /></section> }
        }
        patch(document.body, <body><C /></body>)

        expect(seen).toBe(document.querySelector('section'))
    })

    test('mounted() of elements created by an update runs after the update', () => {
        let show = false
        let seen = ''
        const App = () => <body>{show && <b mounted={() => seen = document.body.innerHTML} />}<i /></body>
        patch(document.body, <App />)
        show = true
        updateview()

        expect(seen).toBe('<b></b><i></i>')
    })

    test('a mounted() callback can update the view', () => {
        let ready = false
        const App = () => <body><b mounted={() => { ready = true; updateview() }} />{ready && <i />}</body>
        patch(document.body, <App />)

        expect(document.body.innerHTML).toBe('<b></b><i></i>')
    })
})
