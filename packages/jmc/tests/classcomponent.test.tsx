import { beforeEach, describe, expect, it, test, vitest } from 'vitest'
import { H, HtmlHTMLAttributes, JMXComp, jsx, patch, updateview } from '../src';
import { Window } from 'happy-dom'

beforeEach(() => {
    const window = new Window({ url: "http://localhost/" })
    window.document.documentElement.innerHTML = `<html><body></body></html>`
    // @ts-expect-error assigning globals
    globalThis.window = window
    // @ts-expect-error assigning globals
    globalThis.document = window.document
})

describe('class components', () => {

    test('class component renders', () => {

        class C extends JMXComp {
            view(): H {
                return <div class="class component C">hi ho</div>
            }
        }

        patch(document.body, <body><C /></body>)
        expect(document.body.outerHTML).toBe('<body><div class="class component C">hi ho</div></body>')
    })

    test('class component underived renders', () => {

        class C {
            view(): H {
                return <div class="class component C">hi ho</div>
            }
        }

        patch(document.body, <body><C /></body>)
        expect(document.body.outerHTML).toBe('<body><div class="class component C">hi ho</div></body>')
    })

    test('class component update with straight jsc update', () => {

        let m = {
            name: "lunar",
            css: "mondo"
        }

        class C extends JMXComp<{ name: string, css: string }> {
            view(): H {
                return <bunny class={this.props.css} carrot={{ grade: 4, breed: "fluffy" }}>{this.props.name}</bunny>
            }
        }

        patch(document.body, <body><C {...m} /></body>)
        expect(document.body.outerHTML).toBe('<body><bunny class="mondo">lunar</bunny></body>')


        m.name = "solar"
        m.css = "jupiter"
        updateview("bunny")
        expect(document.body.outerHTML).toBe('<body><bunny class="jupiter">solar</bunny></body>')
    })

    test('class component update with straight jsc update', () => {

        let m = {
            name: "lunar",
            css: "mondo"
        }

        class C extends JMXComp<{ name: string, css: string }> {
            view(): H {
                return <bunny class={this.props.css} carrot={{ grade: 4, breed: "fluffy" }}>{this.props.name}</bunny>
            }
        }

        patch(document.body, <body><C {...m} /></body>)
        expect(document.body.outerHTML).toBe('<body><bunny class="mondo">lunar</bunny></body>')


        m.name = "solar"
        m.css = "jupiter"
        updateview("bunny")
        expect(document.body.outerHTML).toBe('<body><bunny class="jupiter">solar</bunny></body>')
    })
})

declare global {
    namespace JSX {
        interface IntrinsicElements extends IntrinsicElementAttributes {
            bunny: HtmlHTMLAttributes & { carrot: { grade: number, breed?: string } }
        }
    }
}