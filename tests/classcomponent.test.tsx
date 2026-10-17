import { beforeEach, describe, expect, it } from 'vitest'
import { H, HtmlHTMLAttributes, IntrinsicElementAttributes, Component, jsx, patch, updateview } from '../src'

beforeEach(() => {
    document.documentElement.innerHTML = '<html><body></body></html>'
})

describe('class components', () => {

    it('class component renders', () => {

        class C extends Component {
            view(): H {
                return <div class="class component C">hi ho</div>
            }
        }

        patch(document.body, <body><C /></body>)
        expect(document.body.outerHTML).toBe('<body><div class="class component C">hi ho</div></body>')
    })

    it('class component updates', () => {

        class C extends Component {
            view(): H {
                return <div class="class component C">hi ho</div>
            }
        }

        patch(document.body, <body><C /></body>)
        expect(document.body.outerHTML).toBe('<body><div class="class component C">hi ho</div></body>')

        updateview(document.body)
    })

    it('class component updates inside App', () => {

        class C extends Component {
            view(): H {
                return <div class="class component C">hi ho</div>
            }
        }

        const App = () =>
            <body>
                <C />
            </body>

        patch(document.body, <App />)

        updateview(document.body)
    })

    it('class component updates inside App 2', () => {

        class C extends Component {
            view(): H {
                return <div />
            }
        }

        const App = () =>
            <body>
                <C />
            </body>

        patch(document.body, <App />)

        updateview("div")        
        updateview(document.body)
    })

    it('class component underived renders', () => {

        class C {
            view(): H {
                return <div class="class component C">hi ho</div>
            }
        }

        patch(document.body, <body><C /></body>)
        expect(document.body.outerHTML).toBe('<body><div class="class component C">hi ho</div></body>')
    })

    it('class component updates when its root is updated by selector', () => {

        let m = {
            name: "lunar",
            css: "mondo"
        }

        class C extends Component<{ name: string, css: string }> {
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

    it('class component update with empty update returning true', () => {

        let m = {
            name: "lunar",
            css: "mondo"
        }

        class C extends Component<{ name: string, css: string }> {
            view(): H {
                return <bunny class={this.props.css} carrot={{ grade: 4, breed: "fluffy" }}>{this.props.name}</bunny>
            }
            update() {
                return true // no update
            }
        }

        patch(document.body, <body><C {...m} /></body>)
        expect(document.body.outerHTML).toBe('<body><bunny class="mondo">lunar</bunny></body>')

        m.name = "solar"
        m.css = "jupiter"
        updateview("bunny")
        expect(document.body.outerHTML).toBe('<body><bunny class="mondo">lunar</bunny></body>')
    })

    it('class component update with empty update returning false', () => {

        let m = {
            name: "lunar",
            css: "mondo"
        }

        class C extends Component<{ name: string, css: string }> {
            view(): H {
                return <bunny class={this.props.css} carrot={{ grade: 4, breed: "fluffy" }}>{this.props.name}</bunny>
            }
            update() {
                return false // no update
            }
        }

        patch(document.body, <body><C {...m} /></body>)
        expect(document.body.outerHTML).toBe('<body><bunny class="mondo">lunar</bunny></body>')

        m.name = "solar"
        m.css = "jupiter"
        updateview("bunny")
        expect(document.body.outerHTML).toBe('<body><bunny class="jupiter">solar</bunny></body>')
    })

    it('class component update with empty update modifying', () => {

        let m = {
            name: "lunar",
            css: "mondo"
        }

        class C extends Component<{ name: string, css: string }> {
            view(): H {
                return <bunny class={this.props.css} carrot={{ grade: 4, breed: "fluffy" }}>{this.props.name}</bunny>
            }
            update() {
                this.element.replaceChildren()
                this.element.setAttribute("changed", "now")
                return true // no default update
            }
        }

        patch(document.body, <body><C {...m} /></body>)
        expect(document.body.outerHTML).toBe('<body><bunny class="mondo">lunar</bunny></body>')

        m.name = "solar"
        m.css = "jupiter"
        updateview("bunny")
        expect(document.body.outerHTML).toBe('<body><bunny class="mondo" changed="now"></bunny></body>')
    })

    it('class component re-renders through updateview(1, selector) when update() returns nothing', () => {

        let m = {
            css: "value-1"
        }

        class C extends Component {
            view(): H {
                return <div class={m.css}>bunny</div>
            }
            update() { }
        }

        patch(document.body, <body><C /></body>)
        expect(document.body.outerHTML).toBe('<body><div class="value-1">bunny</div></body>')

        m.css = "value-2"
        updateview(1, "div")
        expect(document.body.outerHTML).toBe('<body><div class="value-2">bunny</div></body>')

        m.css = "value-3"
        updateview(1, "div")
        expect(document.body.outerHTML).toBe('<body><div class="value-3">bunny</div></body>')

        updateview()
        expect(document.body.outerHTML).toBe('<body><div class="value-3">bunny</div></body>')
    })
})

declare module '../src' {
    namespace jsx {
        namespace JSX {
            interface IntrinsicElements {
                bunny: HtmlHTMLAttributes & { carrot: { grade: number, breed?: string } }
            }
        }
    }
}