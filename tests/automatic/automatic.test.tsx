// the automatic JSX runtime: no jsx import, the compiler imports from @snupo/jmc/jsx-runtime
import { beforeEach, describe, expect, test } from 'vitest'
import { Component, patch, updateview, type Children, type H, type HtmlHTMLAttributes } from '@snupo/jmc'
import { jsx, jsxs, Fragment } from '@snupo/jmc/jsx-runtime'
import { jsxDEV } from '@snupo/jmc/jsx-dev-runtime'

declare module '@snupo/jmc' {
    namespace jsx {
        namespace JSX {
            interface IntrinsicElements {
                'my-chart': HtmlHTMLAttributes & { data: number[] }
            }
        }
    }
}

beforeEach(() => {
    document.documentElement.innerHTML = '<html><body></body></html>'
})

describe('rendering', () => {
    test('elements, fragments, lists, class components and booleans render and update', () => {
        let n = 0
        class Counter extends Component<{ start: number }> {
            view(): H { return <em>{this.props.start + n}</em> }
        }
        const App = () =>
            <body>
                <b title={String(n)}>{n}</b>
                <><i /></>
                {[1, 2].map(x => <u>{x}</u>)}
                <Counter start={5} />
                {false}
            </body>

        patch(document.body, <App />)
        n = 1
        updateview()

        expect(document.body.innerHTML).toBe('<b title="1">1</b><i></i><u>1</u><u>2</u><em>6</em>')
    })

    test('an element does not get children as a prop', () => {
        patch(document.body, <body><div><b /><i /></div></body>)
        const div = document.querySelector('div')!
        expect(div.hasAttribute('children')).toBe(false)
        expect(div.children.length).toBe(2) // the DOM property, untouched
    })

    test('custom elements declared on jsx.JSX work', () => {
        patch(document.body, <body><my-chart data={[1, 2]} /></body>)
        expect((document.querySelector('my-chart') as any).data).toEqual([1, 2])
    })

    test('the JSX types are enforced', () => {
        // @ts-expect-error unknown element
        let unknown = <nosuchtag />
        // @ts-expect-error wrong attribute type
        let wrongattr = <div title={42} />
        // @ts-expect-error wrong type on a custom element
        let wrongcustom = <my-chart data='x' />
        expect([unknown, wrongattr, wrongcustom].length).toBe(3)
    })
})

describe('children of components', () => {
    test('a function component gets its children in props.children', () => {
        const Box = (p: { title: string, children?: Children }) => <section title={p.title}>{p.children}</section>

        patch(document.body, <body><Box title='one'><b /></Box><Box title='two'><b /><i /></Box><Box title='none' /></body>)

        expect(document.body.innerHTML).toBe('<section title="one"><b></b></section><section title="two"><b></b><i></i></section><section title="none"></section>')
    })

    test('a class component gets its children in this.props.children', () => {
        class Panel extends Component<{ children?: Children }> {
            view(): H { return <article>{this.props.children}</article> }
        }

        patch(document.body, <body><Panel><b /><i /></Panel></body>)

        expect(document.body.innerHTML).toBe('<article><b></b><i></i></article>')
    })

    // TBD REMOVE together with the second parameter of function components
    test('a function component still gets its children as second argument', () => {
        const Old = (_p: { children?: Children }, cn?: Children) => <section>{cn}</section>

        patch(document.body, <body><Old><b /></Old></body>)

        expect(document.body.innerHTML).toBe('<section><b></b></section>')
    })
})

describe('runtime functions', () => {
    test('jsx takes one child, jsxs an array of children, Fragment groups', () => {
        patch(document.body, jsx('body', { children: jsxs(Fragment, { children: [jsx('b', {}), jsx('i', { children: 'x' })] }) }))
        expect(document.body.innerHTML).toBe('<b></b><i>x</i>')
    })

    test('jsxDEV renders like jsx and jsxs', () => {
        patch(document.body, jsxDEV('body', { children: [jsxDEV('b', {}, undefined, false), jsxDEV('i', { children: 'x' }, undefined, false)] }, undefined, true))
        expect(document.body.innerHTML).toBe('<b></b><i>x</i>')
    })
})
