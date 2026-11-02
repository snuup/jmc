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

    it('function component rendering a class component is attached to the root and keeps the instance', () => {

        let m = { name: 'lunar' }
        let instances = 0
        class C extends Component<{ name: string }> {
            constructor(p: { name: string }) { super(p); instances++ }
            view(): H {
                return <div>{this.props.name}</div>
            }
        }
        let F = () => <C name={m.name} />

        patch(document.body, <body><F /></body>)
        expect(document.body.outerHTML).toBe('<body><div>lunar</div></body>')

        m.name = 'solar'
        updateview('div')
        expect(document.body.outerHTML, 'the root is attached to F, so F runs again and passes the new name').toBe('<body><div>solar</div></body>')
        expect(instances, 'C is reused').toBe(1)

        m.name = 'stellar'
        updateview()
        expect(document.body.outerHTML).toBe('<body><div>stellar</div></body>')
        expect(instances, 'C is reused when the parent renders').toBe(1)
    })

    it('class component rendering a class component keeps both instances', () => {

        let m = { name: 'lunar' }
        let outers = 0, inners = 0
        class Inner extends Component<{ name: string }> {
            constructor(p: { name: string }) { super(p); inners++ }
            view(): H {
                return <div>{this.props.name}</div>
            }
        }
        class Outer extends Component {
            constructor(p: {}) { super(p); outers++ }
            view(): H {
                return <Inner name={m.name} />
            }
        }

        patch(document.body, <body><Outer /></body>)
        expect(document.body.outerHTML).toBe('<body><div>lunar</div></body>')

        m.name = 'solar'
        updateview('div')
        expect(document.body.outerHTML, 'the root is attached to Outer').toBe('<body><div>solar</div></body>')
        updateview()
        expect([outers, inners]).toEqual([1, 1])
    })

    it('function component rendering a class component that renders nothing keeps the instance', () => {

        let m = { show: true }
        let instances = 0
        class C extends Component<{ show: boolean }> {
            constructor(p: { show: boolean }) { super(p); instances++ }
            view(): H | null {
                return this.props.show ? <div>hi</div> : null
            }
        }
        let F = () => <C show={m.show} />

        patch(document.body, <body><F /></body>)
        m.show = false
        updateview()
        expect(document.body.outerHTML).toBe('<body><!----></body>')
        m.show = true
        updateview()
        expect(document.body.outerHTML).toBe('<body><div>hi</div></body>')
        expect(instances).toBe(1)
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