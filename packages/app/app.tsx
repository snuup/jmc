import {
    jsx,
    jsxf,
    patch,
    updateview,
    JMXComp,
    mount,
    type HtmlHTMLAttributes,
    type IntrinsicElementAttributes,
    Selector,
    Selectors,
    updateviewuc,
    cc
} from '../jmc'
import './lab.css'

let m = {
    x: 41,
    name: 'm-name',
}

let Hase = (
    <>
        <div>1</div>
        <div>2</div>
        <div>3</div>
    </>
)

class Compo extends JMXComp<{ mm: { name: string } }> {
    view() {
        console.log('uuuu')
        return <article onclick={this.clicks}>art {this.props.mm.name} art</article>
    }
    clicks() {
        console.log('clicks!')
        this.props.mm.name = 'hopsi'
        this.updateview()
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements extends IntrinsicElementAttributes {
            counter: HtmlHTMLAttributes & {
                name: string
            }
        }
    }
}

type Action = () => {}

// let Counter: FComponentState<
//     { name: string },
//     { count: number, configure: (a: any) => {} },
//     { increment: Action, decrement: Action }> = function ({ name }) {
//         this.configure(() => ({
//             increment: () => { this.count++, this.update() },
//             decrement: () => { this.count--; this.update() }
//         }))
//         this.aa = 72
//         this.count = 50
//         this.increment
//         //this.uc = [{ patchElementOnly: true }]
//         return <counter class={this.count.toString()}>
//             <i>{name} - {Date.now}</i>
//             <b>{this.count}</b>
//             <button onclick={this.increment}>i</button>
//             <button onclick={() => { this.count++; this.update("b") }}>b</button>
//             <button onclick={() => { this.count++; this.update(this.element) }}>this.element</button>
//             <button onclick={() => { this.count++; this.update("i", "b") }}>i + b</button>
//             {/* <button onclick={() => { this.count++; this.update({ patchElementOnly: true }) }}>patchelementonly</button> */}
//             <button onclick={() => { this.count++; this.update() }}>empty</button>
//         </counter>
//     }

let X = () => <a></a>

console.log(X)

let AA = () => <a>"" {42}</a>

function BB() {
    return <aside>{999}</aside>
}

let Lab = () => (
    <b>
        {m.x}
        <AA />
    </b>
)

let D = ({ value }: { value: number }) => (
    <div>
        {m.x}: {value}
    </div>
)

// let App = () => {
//     let i = 10
//     return (
//         <body class={m.x.toString()} onclick={() => alert(2)}>
//             <aside>aside</aside>
//             <D value={i++} />
//             <D value={i++} />
//             hase war da 12: <Lab />
//             <Compo mm={m} />
//         </body>
//     )
// }

// let App2 = () => (
//     <body>
//         <>
//             <div>1</div>
//             <div>2</div>
//             <div>3</div>
//         </>
//     </body>
// )

// patch(document.body, <App2 />)

// let x = () => <a href={(() => '4') as any as string}></a>

// mount({ m, updateview })

// window.ondblclick = () => {
//     console.log('dbl')
//     m.x = 7788
//     updateview('div')
// }

let m2 = {
    sidepanel: false,
    longlist: [1, 2, 3]
}

let B = ({ x }: { x: number }) => {
    return <i><b>{x}</b></i>
}

let I = ({ x }: { x: number }) => {
    return <i><B x={x} /></i>
}

declare global {
    namespace JSX {
        interface IntrinsicElements extends IntrinsicElementAttributes {
            side: HtmlHTMLAttributes
        }
    }
}

let Side = <side>
    <B x={1} />
    <B x={2} />
    <B x={4} />
</side>

let App = () => <body class={cc({ sidepanel: m2.sidepanel })}>
    <Side />
</body>

patch(document.body, App)

console.log("updating")
m2.sidepanel = true
updateviewuc({ patchElementOnly: true }, "body")

mount({ updateviewuc })