import { jsx, patch, updateview, type HtmlHTMLAttributes } from '../jmc/src'
import './lab.css'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            side: HtmlHTMLAttributes
        }
    }
}

let m = { name: "bugs" }

let Comp = ({ name }: { name: String }) => {
    console.log("Comp", name)
    return <b>{name}</b>
}

let App = () => <body>
    <Comp name={m.name} />
</body>

patch(document.body, <App />)

console.log("now updating");


m.name = "duffy"
updateview()
