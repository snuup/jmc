// classic JSX: components get their children in props.children, like with the automatic runtime
import { beforeEach, describe, expect, test } from 'vitest'
import { Component, jsx, patch, type Children, type H } from '../src'

beforeEach(() => {
    document.documentElement.innerHTML = '<html><body></body></html>'
})

describe('children of components in classic JSX', () => {
    test('a function component gets its children in props.children', () => {
        const Box = (p: { title: string, children?: Children }) => <section title={p.title}>{p.children}</section>

        patch(document.body, <body><Box title='one'><b /></Box><Box title='two'><b /><i /></Box></body>)

        expect(document.body.innerHTML).toBe('<section title="one"><b></b></section><section title="two"><b></b><i></i></section>')
    })

    test('a class component gets its children in this.props.children', () => {
        class Panel extends Component<{ children?: Children }> {
            view(): H { return <article>{this.props.children}</article> }
        }

        patch(document.body, <body><Panel><b /></Panel></body>)

        expect(document.body.innerHTML).toBe('<article><b></b></article>')
    })

    test('a component without children has no children prop', () => {
        let seen: any
        const F = (p: any) => { seen = p; return <b /> }

        patch(document.body, <body><F x={1} /></body>)

        expect(seen).toEqual({ x: 1 })
    })

    test('the props object written in the JSX is not changed', () => {
        const props = { title: 't' }
        const Box = (p: { title: string, children?: Children }) => <section>{p.children}</section>

        patch(document.body, jsx('body', null, jsx(Box, props, jsx('b', null))))

        expect(props).toEqual({ title: 't' })
    })

    // TBD REMOVE together with the second parameter of function components
    test('a function component still gets its children as second argument', () => {
        const Old = (_p: {}, cn?: Children) => <section>{cn}</section>

        patch(document.body, <body><Old><b /></Old></body>)

        expect(document.body.innerHTML).toBe('<section><b></b></section>')
    })
})
