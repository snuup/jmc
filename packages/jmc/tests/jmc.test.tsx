import { jsx, jsxf, patch, HElement, JMXComp, Expr, H, updateview, HtmlHTMLAttributes, IntrinsicElementAttributes, updateviewuc, HClassComponent } from '../src/index'
import { describe, expect, beforeEach, it } from 'vitest'
import { Window } from 'happy-dom'

beforeEach(() => {
    const window = new Window({url: "http://localhost/"})
    window.document.documentElement.innerHTML = `<html><body></body></html>`
    // @ts-expect-error assigning globals
    globalThis.window = window
    // @ts-expect-error assigning globals
    globalThis.document = window.document
})

describe('JMX dom tests', () => {

    it('HTag 1', () => {

        var h: HElement = <body>hase</body>

        patch(document.body, h)
        expect(document.body.outerHTML).toBe("<body>hase</body>")
    })

    it('HTag 1 thunked', () => {

        var h: HElement = <body>hase</body>

        patch(document.body, h)
        expect(document.body.outerHTML).toBe("<body>hase</body>")
    })

    it('HTag 2', () => {

        let h = <body class="cc">hase{42}{true}{false}</body>

        patch(document.body, h)
        expect(document.body.className).toBe("cc")
        expect(document.body.innerHTML).toBe("hase42truefalse")
    })

    it('HFunction', () => {

        let F = ({ x }: { x: number }) => <div class={"classo" + x * 3}>{x * 2}</div>
        let a = <body><F x={7} /></body>

        patch(document.body, a)
        expect(document.body.outerHTML).toBe('<body><div class="classo21">14</div></body>')
    })

    it('clear styles after update', () => {

        patch(document.body, <body><div class="hase">div</div></body>)
        expect(document.body.innerHTML).toBe('<div class="hase">div</div>')

        patch(document.querySelector("div")!, <div>snuff</div>)
        expect(document.body.innerHTML).toBe('<div>snuff</div>')
    })

    it('fragments', () => {

        let F = <>
            <b>1</b>
            <b>2</b>
            <b>3</b>
        </>

        patch(document.body, <body><F /></body>)
        expect(document.body.innerHTML).toBe('<b>1</b><b>2</b><b>3</b>')
    })

    it('fragment thunked', () => {

        let F = () => <>
            <b>1</b>
            <b>2</b>
            <b>3</b>
        </>

        patch(document.body, <body><F /></body>)
        expect(document.body.innerHTML).toBe('<b>1</b><b>2</b><b>3</b>')
    })

    it('fragments many', () => {

        let F = <>
            <b>1</b>
            <b>2</b>
            <b>3</b>
        </>

        patch(document.body, <body><F /><F /></body>)
        expect(document.body.innerHTML).toBe('<b>1</b><b>2</b><b>3</b><b>1</b><b>2</b><b>3</b>')
    })

    it('element as object', () => {

        let D = <div />

        patch(document.body, <body><D /></body>)
        expect(document.body.innerHTML).toBe('<div></div>')
    })

    it('element as thunked object', () => {

        let D = () => <div />

        patch(document.body, <body><D /></body>)
        expect(document.body.innerHTML).toBe('<div></div>')
    })

    it('class component is constructed', () => {

        class C extends JMXComp {
            view() {
                return 'bunny component'
            }
        }

        patch(document.body, <body><C /></body>)
        expect(document.body.innerHTML).toBe('bunny component')
    })

    it('class component h is attached', () => {
        class C extends JMXComp {
            view() {
                return <div />
            }
        }

        patch(document.body, <body><C /></body>)
        expect(document.querySelector("div")?.h).toBeDefined()
        expect(document.body.innerHTML).toBe("<div></div>")
    })

    it('class component instance h.i is attached', () => {
        class C extends JMXComp {
            view() {
                return <div />
            }
        }

        patch(document.body, <body><C /></body>)
        let h = document.querySelector("div")?.h as HClassComponent
        expect(h.i).toBeDefined()
    })

    it('fragments in context', () => {

        let F = <>
            <b>1</b>
        </>

        let A = <div>
            <F />
            <article></article>
            <aside></aside>
        </div>

        patch(document.body, <body><A /></body>)
        expect(document.body.innerHTML).toBe('<div><b>1</b><article></article><aside></aside></div>')
    })

    it('fragments in context2', () => {

        let F = () => <>
            <b>1</b>
        </>

        let A = <div>
            <F />
            <article></article>
            <aside></aside>
        </div>

        patch(document.body, <body><A /></body>)
        expect(document.body.innerHTML).toBe('<div><b>1</b><article></article><aside></aside></div>')
    })

    it('patch class component', () => {
        class C extends JMXComp {
            view() {
                return <aside>hase war da</aside>
            }
        }

        document.body.innerHTML = "<div />"
        patch(document.body.querySelector("div"), <C />)
        expect(document.body.innerHTML).toBe("<aside>hase war da</aside>")
    })

    it('svg autonamespace', () => {

        let h = <div>
            <circle id="c1" />
            <svg xmlns="http://www.w3.org/2000/svg">
                <circle id="c2" />
            </svg>
        </div>

        patch(document.body, h)
        let svg = document.querySelector("svg")
        expect(svg).toBeInstanceOf(SVGElement)
        expect(svg?.namespaceURI).toBe("http://www.w3.org/2000/svg")

        expect(document.getElementById("c1")?.namespaceURI).toBe("http://www.w3.org/1999/xhtml")
        expect(document.getElementById("c2")?.namespaceURI).toBe("http://www.w3.org/2000/svg")
    })

    it('Expression', () => {

        let F  = () => <div><b>bunny</b></div>
        let H = () => <body>hase</body>

        patch(document.body, <H />)
        expect(document.body.outerHTML).toBe("<body>hase</body>")
    })

    it('Expression is updated', () => {

        let m = { name: 'bugs' }
        let F: Expr<H> = () => <body>{m.name}</body>

        patch(document.body, <F />)
        expect(document.body.outerHTML).toBe("<body>bugs</body>")

        m.name = 'bunny'
        updateview()
        expect(document.body.outerHTML).toBe("<body>bunny</body>")
    })

    it('patchelementonly does not expand the whole subtree', () => {

        let m = {
            sidepanel: false,
            longlist: [1, 2, 3]
        }

        let B = ({ x }: { x: number }) => {
            return <b>{x}</b>
        }

        let Side = <side>
            {m.longlist.map(x => <B x={x} />)}
        </side>

        let App = () => <body>
            <Side />
        </body>

        patch(document.body, <App />)
        expect(document.body.outerHTML).toBe("<body><side><b>1</b><b>2</b><b>3</b></side></body>")

        console.log("updating")
        m.sidepanel = true

        updateviewuc({ patchElementOnly: true }, "body")
    })

    it('patchelementonly does not expand the whole subtree 2', () => {

        let m = {
            sidepanel: false,
            longlist: [1, 2, 3]
        }

        let B = ({ x }: { x: number }) => {
            return <b>{x}</b>
        }

        let Side = () => <side>
            {m.longlist.map(x => <B x={x} />)}
        </side>

        let App = () => <body>
            <Side />
        </body>

        console.log("patch initial")
        patch(document.body, <App />)
        expect(document.body.outerHTML).toBe("<body><side><b>1</b><b>2</b><b>3</b></side></body>")

        console.log("updating")
        m.sidepanel = true

        updateviewuc({ patchElementOnly: true }, "body")
    })

    it('patchelementonly does not expand the whole subtree 3', () => {

        let m = {
            sidepanel: false,
            longlist: [1, 2, 3]
        }

        let B = ({ x }: { x: number }) => {
            return <i><b>{x}</b></i>
        }

        let I = ({ x }: { x: number }) => {
            return <i><B x={x} /></i>
        }

        let Side = <side>
            <B x={1} />
            <B x={2} />
            <B x={4} />
        </side>

        let App = () => <body>
            <Side />
        </body>

        patch(document.body, <App />)
        expect(document.body.outerHTML).toBe("<body><side><i><b>1</b></i><i><b>2</b></i><i><b>4</b></i></side></body>")

        console.log("updating")
        m.sidepanel = true
        updateviewuc({ patchElementOnly: true }, "body")
        expect(document.body.outerHTML).toBe("<body><side><i><b>1</b></i><i><b>2</b></i><i><b>4</b></i></side></body>")
    })
})

declare global {
    namespace JSX {
        interface IntrinsicElements extends IntrinsicElementAttributes {
            side: HtmlHTMLAttributes
        }
    }
}