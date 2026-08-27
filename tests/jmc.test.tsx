import { jsx, jsxf, patch, HElement, JMXComp, updateview, HtmlHTMLAttributes, IntrinsicElementAttributes, HClassComponent, HFunctionComponent, H } from "../src"
import { describe, expect, beforeEach, it, vi } from 'vitest'
import { Window } from 'happy-dom'

beforeEach(() => {
    const window = new Window({ url: 'http://localhost/' })
    window.document.documentElement.innerHTML = `<html><body></body></html>`
    // @ts-expect-error assigning globals
    globalThis.window = window
    // @ts-expect-error assigning globals
    globalThis.document = window.document
})

describe('jmc dom tests', () => {
    it('HTag 1', () => {
        var h: HElement = <body>hase</body>

        patch(document.body, h)
        expect(document.body.outerHTML).toBe('<body>hase</body>')
    })

    it('HTag 1 thunked', () => {
        var h: HElement = <body>hase</body>

        patch(document.body, h)
        expect(document.body.outerHTML).toBe('<body>hase</body>')
    })

    it('HTag 2', () => {
        let h = (
            <body class='cc'>
                hase{42}
                {true}
                {false}
            </body>
        )

        patch(document.body, h)
        expect(document.body.className).toBe('cc')
        expect(document.body.innerHTML).toBe('hase42truefalse')
    })

    it('HFunction', () => {
        let F = ({ x }: { x: number }) => (
            <div class={'classo' + x * 3}>{x * 2}</div>
        )
        let a = (
            <body>
                <F x={7} />
            </body>
        )

        patch(document.body, a)
        expect(document.body.outerHTML).toBe(
            '<body><div class="classo21">14</div></body>',
        )
    })

    it('clear styles after update', () => {
        patch(
            document.body,
            <body>
                <div class='hase'>div</div>
            </body>,
        )
        expect(document.body.innerHTML).toBe('<div class="hase">div</div>')

        patch(document.querySelector('div')!, <div>snuff</div>)
        expect(document.body.innerHTML).toBe('<div>snuff</div>')
    })

    it('fragments', () => {
        let F = (
            <>
                <b>1</b>
                <b>2</b>
                <b>3</b>
            </>
        )

        patch(
            document.body,
            <body>
                <F />
            </body>,
        )
        expect(document.body.innerHTML).toBe('<b>1</b><b>2</b><b>3</b>')
    })

    it('fragment thunked', () => {
        let F = () => (
            <>
                <b>1</b>
                <b>2</b>
                <b>3</b>
            </>
        )

        patch(
            document.body,
            <body>
                <F />
            </body>,
        )
        expect(document.body.innerHTML).toBe('<b>1</b><b>2</b><b>3</b>')
    })

    it('fragments many', () => {
        let F = (
            <>
                <b>1</b>
                <b>2</b>
                <b>3</b>
            </>
        )

        patch(
            document.body,
            <body>
                <F />
                <F />
            </body>,
        )
        expect(document.body.innerHTML).toBe(
            '<b>1</b><b>2</b><b>3</b><b>1</b><b>2</b><b>3</b>',
        )
    })

    it('element as object', () => {
        let D = <div />

        patch(
            document.body,
            <body>
                <D />
            </body>,
        )
        expect(document.body.innerHTML).toBe('<div></div>')
    })

    it('element as thunked object', () => {
        let D = () => <div />

        patch(
            document.body,
            <body>
                <D />
            </body>,
        )
        expect(document.body.innerHTML).toBe('<div></div>')
    })

    it('class component is constructed', () => {
        class C extends JMXComp {
            view() {
                return 'bunny component'
            }
        }

        patch(
            document.body,
            <body>
                <C />
            </body>,
        )
        expect(document.body.innerHTML).toBe('bunny component')
    })

    it('class component h is attached', () => {
        class C extends JMXComp {
            view() {
                return <div />
            }
        }

        patch(
            document.body,
            <body>
                <C />
            </body>,
        )
        expect(document.querySelector('div')?.h).toBeDefined()
        expect(document.body.innerHTML).toBe('<div></div>')
    })

    it('class component instance h.i is attached', () => {
        class C extends JMXComp {
            view() {
                return <div />
            }
        }

        patch(
            document.body,
            <body>
                <C />
            </body>,
        )
        let h = document.querySelector('div')?.h as HClassComponent
        expect(h.i).toBeDefined()
    })

    it('fragments in context', () => {
        let F = (
            <>
                <b>1</b>
            </>
        )

        let A = (
            <div>
                <F />
                <article></article>
                <aside></aside>
            </div>
        )

        patch(
            document.body,
            <body>
                <A />
            </body>,
        )
        expect(document.body.innerHTML).toBe(
            '<div><b>1</b><article></article><aside></aside></div>',
        )
    })

    it('fragments in context2', () => {
        let F = () => (
            <>
                <b>1</b>
            </>
        )

        let A = (
            <div>
                <F />
                <article></article>
                <aside></aside>
            </div>
        )

        patch(
            document.body,
            <body>
                <A />
            </body>,
        )
        expect(document.body.innerHTML).toBe(
            '<div><b>1</b><article></article><aside></aside></div>',
        )
    })

    it('patch class component', () => {
        class C extends JMXComp {
            view() {
                return <aside>hase war da</aside>
            }
        }

        document.body.innerHTML = '<div />'
        patch(document.body.querySelector('div'), <C />)
        expect(document.body.innerHTML).toBe('<aside>hase war da</aside>')
    })

    it('svg autonamespace', () => {
        let h = (
            <div>
                <circle id='c1' />
                <svg xmlns='http://www.w3.org/2000/svg'>
                    <circle id='c2' />
                </svg>
            </div>
        )

        patch(document.body, h)
        let svg = document.querySelector('svg')
        expect(svg).toBeInstanceOf(SVGElement)
        expect(svg?.namespaceURI).toBe('http://www.w3.org/2000/svg')

        expect(document.getElementById('c1')?.namespaceURI).toBe(
            'http://www.w3.org/1999/xhtml',
        )
        expect(document.getElementById('c2')?.namespaceURI).toBe(
            'http://www.w3.org/2000/svg',
        )
    })

    it('Expression', () => {
        let F = () => (
            <div>
                <b>bunny</b>
            </div>
        )
        let H = () => <body>hase</body>

        patch(document.body, <H />)
        expect(document.body.outerHTML).toBe('<body>hase</body>')
    })

    it('Expression is updated', () => {
        let m = { name: 'bugs' }
        let F = () => <body>{m.name}</body>

        patch(document.body, <F />)
        expect(document.body.outerHTML).toBe('<body>bugs</body>')

        m.name = 'bunny'
        updateview()
        expect(document.body.outerHTML).toBe('<body>bunny</body>')
    })

    it('patchelementonly does not expand the whole subtree', () => {
        let m = {
            sidepanel: false,
            longlist: [1, 2, 3],
        }

        let B = ({ x }: { x: number }) => {
            return <b>{x}</b>
        }

        let Side = (
            <side>
                {m.longlist.map((x) => (
                    <B x={x} />
                ))}
            </side>
        )

        let App = () => (
            <body>
                <Side />
            </body>
        )

        patch(document.body, <App />)
        expect(document.body.outerHTML).toBe(
            '<body><side><b>1</b><b>2</b><b>3</b></side></body>',
        )

        // console.log('updating')
        m.sidepanel = true

        updateview({ patchElementOnly: true }, 'body')
    })

    it('patchelementonly does not expand the whole subtree 2', () => {
        let m = {
            sidepanel: false,
            longlist: [1, 2, 3],
        }

        let B = ({ x }: { x: number }) => {
            return <b>{x}</b>
        }

        let Side = () => (
            <side>
                {m.longlist.map((x) => (
                    <B x={x} />
                ))}
            </side>
        )

        let App = () => (
            <body>
                <Side />
            </body>
        )

        // console.log('patch initial')
        patch(document.body, <App />)
        expect(document.body.outerHTML).toBe(
            '<body><side><b>1</b><b>2</b><b>3</b></side></body>',
        )

        // console.log('updating')
        m.sidepanel = true

        updateview({ patchElementOnly: true }, 'body')
    })

    it('patchelementonly does not expand the whole subtree 3', () => {
        let m = {
            sidepanel: false,
            longlist: [1, 2, 3],
        }

        let B = ({ x }: { x: number }) => {
            return (
                <i>
                    <b>{x}</b>
                </i>
            )
        }

        let I = ({ x }: { x: number }) => {
            return (
                <i>
                    <B x={x} />
                </i>
            )
        }

        let Side = (
            <side>
                <B x={1} />
                <B x={2} />
                <B x={4} />
            </side>
        )

        let App = () => (
            <body>
                <Side />
            </body>
        )

        patch(document.body, <App />)
        expect(document.body.outerHTML).toBe(
            '<body><side><i><b>1</b></i><i><b>2</b></i><i><b>4</b></i></side></body>',
        )

        //console.log('updating')
        m.sidepanel = true
        updateview({ patchElementOnly: true }, 'body')
        expect(document.body.outerHTML).toBe(
            '<body><side><i><b>1</b></i><i><b>2</b></i><i><b>4</b></i></side></body>',
        )
    })

    it('const attribute blocks updates', () => {
        patch(
            document.body,
            <body>
                <div const={true} />
            </body>,
        )

        let div = document.querySelector('div')!
        let observer = new MutationObserver(() => {
            console.log('change')
        })
        observer.observe(div, { attributes: true, subtree: true })

        patch(
            document.body,
            <body>
                <div const={true}>new</div>
            </body>,
        )

        expect(document.body.outerHTML).toBe(
            '<body><div const="true"></div></body>',
        )
    })

    // with functions, that wont work
    it('function component is attached correctly', () => {
        let F = () => <b>1</b>

        let App = () => (
            <body>
                <F />
            </body>
        )

        patch(document.body, <App />)

        let b = document.querySelector('b')!
        expect((b.h as HFunctionComponent).tag).toBe(F)
    })

    it('nested function components: outer most is attached', () => {
        let Outer = () => <Inner />

        let Inner = () => <b>1</b>

        let App = () => (
            <body>
                <Outer />
            </body>
        )

        patch(document.body, <App />)

        let b = document.querySelector('b')!
        expect((b.h as HFunctionComponent).tag).toBe(Outer)
    })

    it('mounted is called and const respected', () => {
        function islanddom(e: Node) {
            e = e as HTMLElement
            e.appendChild(document.createTextNode('bunny text node'))
        }
        let F = () => <b mounted={islanddom} const></b>
        let App = () => (
            <body>
                <F />
            </body>
        )

        patch(document.body, <App />)

        expect(document.body.outerHTML).toBe('<body><b const="true">bunny text node</b></body>')
        updateview("b")
        expect(document.body.outerHTML).toBe('<body><b const="true">bunny text node</b></body>')
        updateview()
        expect(document.body.outerHTML).toBe('<body><b const="true">bunny text node</b></body>')
    })


    it('props update', () => {

        patch(document.body, <body a={2}></body>)
        expect(document.body.outerHTML).toBe('<body a="2"></body>')

        patch(document.body, <body a={3}></body>)
        expect(document.body.outerHTML).toBe('<body a="3"></body>')
    });

    it('uc.patchelementonly does not touch children', () => {

        let name = "bugs bunny"
        let title = "a"

        let App = () => <body title={title}>{name}</body>

        patch(document.body, <App />)
        expect(document.body.outerHTML).toBe('<body title="a">bugs bunny</body>')

        name = "duffy duck"
        title = "b"
        updateview(1, "body")
        expect(document.body.outerHTML, "children are not updated").toBe('<body title="b">bugs bunny</body>')
    });

    it('uc.replace creates new children', () => {

        let name = "aaa"
        let App = () => <body><div>{name}</div></body>

        patch(document.body, <App />)
        let d1 = document.querySelector("div")

        updateview()
        let d2 = document.querySelector("div")
        expect(d1).toBe(d2)

        name = "bbb"
        updateview(0, "body")
        let d3 = document.querySelector("div")
        expect(d1).not.toBe(d3)
        expect(document.body.outerHTML).toBe("<body><div>bbb</div></body>")
    });

    it('element update-callback receives updatecontext', () => {

        const updatecallback = vi.fn()

        function cb(uc: any) {
            console.log(uc)
        }

        let App = () => <body><div update={updatecallback}>bunny</div></body>

        patch(document.body, <App />)
        expect(updatecallback).not.toHaveBeenCalled()

        updateview({ updatemarkers: true }, "body")
        let div = document.querySelector("div")!
        expect(updatecallback).toHaveBeenCalledOnce()
        expect(updatecallback).toHaveBeenCalledWith(div, { updatemarkers: true })
    })

    it('class update receives updatecontext', () => {

        class C extends JMXComp {
            view(): H {
                return <aside>C</aside>
            }
            update(uc: any) { }
        }

        const spy = vi.spyOn(C.prototype, 'update')

        let App = () => <body><C /></body>

        patch(document.body, <App />)

        expect(spy).not.toHaveBeenCalled()

        updateview({ updatemarkers: true }, "body")
        let div = document.querySelector("div")!
        expect(spy).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledWith({ updatemarkers: true })
    })

    it('update contexts are sent correctly', () => {

        class C extends JMXComp {
            view(): H { return <aside>C</aside> }
            update(uc: any) { }
        }
        const spy = vi.spyOn(C.prototype, 'update')

        let App = () => <body>
            <b><C /></b>
            <i><C /></i>
        </body>

        patch(document.body, <App />)
        updateview({ u: 1 }, "b", { u: 2 }, "i")

        expect(spy).toHaveBeenNthCalledWith(1, { u: 1 })
        expect(spy).toHaveBeenNthCalledWith(2, { u: 2 })
    })

    it('sync does not mutate constant children', () => {

        let App = <body><div /></body>
        patch(document.body, <App />)

        const mutationcallback = vi.fn()
        let o = new MutationObserver(mutationcallback)
        o.observe(document.body, { subtree: true, childList: true })

        updateview()

        expect(mutationcallback).not.toHaveBeenCalled()
    });

    it('sync does not mutate or replace constant children', () => {
        let App = <body><div id="keep-me" /></body>
        patch(document.body, <App />)

        const child = document.getElementById('keep-me')!

        // Track node removal/disconnection
        let disconnected = false
        // Note: Node.prototype.removeChild or parentNode mutation listening
        const originalRemove = child.remove
        child.remove = function () {
            disconnected = true
            return originalRemove.call(this)
        }

        updateview()

        // Verify the retained element was never detached/reinserted
        expect(disconnected).toBe(false)
        expect(document.body.firstElementChild).toBe(child)
    })

    it('sync does not detach constant children', () => {
        let App = <body><div id="keep-me" /></body>
        patch(document.body, <App />)

        const child = document.getElementById('keep-me')!

        // Spy on node removal or check if the exact same node instance 
        // was re-appended vs left completely alone.
        const originalAppendChild = document.body.appendChild
        let appendCount = 0
        document.body.appendChild = function (this: any, node: HTMLElement) {
            if (node === child) appendCount++
            return originalAppendChild.call(this, node)
        } as any

        updateview()

        // With replaceChildren, child is stripped and re-appended.
        // With a pure truncation approach, child is never touched.
        expect(appendCount).toBe(0)
    })

    it('namespace is correct inside foreignObject', () => {

        let App = <body>
            <svg xmlns="http://www.w3.org/2000/svg">
                <g>
                    <foreignObject>
                        <canvas />
                    </foreignObject>
                    <g />
                </g>
            </svg>
        </body>

        patch(document.body, App)

        expect(document.getElementsByTagName("body")[0].namespaceURI).toBe('http://www.w3.org/1999/xhtml')
        expect(document.getElementsByTagName("svg")[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(document.getElementsByTagName("g")[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(document.getElementsByTagName("foreignObject")[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(document.getElementsByTagName("g")[1].namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(document.getElementsByTagName("canvas")[0].namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    })

    it('class view returns undefined', () => {

        class C extends JMXComp {
            view(): H {
                return undefined
            }
        }

        let App = <body>
            <C />
        </body>

        patch(document.body, App)
    });

})

declare global {
    namespace JSX {
        interface IntrinsicElements extends IntrinsicElementAttributes {
            side: HtmlHTMLAttributes
            body: HtmlHTMLAttributes & { a?: number }
        }
    }
}
