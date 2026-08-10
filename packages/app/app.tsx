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
    cc,
    Children,
    HKind,
    lazy
} from '../jmc/src'
import './lab.css'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            side: HtmlHTMLAttributes
        }
    }
}

let person = {
    name: "bugs"
}

let m = {
    person,
    name: "bugs"
}

mount({ m, updateview, lazy })

export const When = ({ cond }: { cond: boolean }, cn: Children) => cond ? <>{cn}</> : undefined

let Comp = ({ name }: { name: String }) => {
    console.log("Comp", name)
    return <b>{name}</b>
}

let App = () => <body>
    <Comp name={lazy(() => m.name)} />
</body>

patch(document.body, <App />)

m.name = "duffy"
updateview("b")
