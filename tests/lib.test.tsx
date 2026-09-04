import { H, jsx, patch, When } from "../src"
import { describe, expect, it } from "vitest"

describe('jmc library tests', () => {

    it('When true', () => {

        let Comp = () => <When cond={true}><div>here goes</div></When>

        patch(document.body, <body><Comp /></body>)
    })

    it('When false', () => {

        let Comp = () => <When cond={false}><div>here goes</div></When>

        patch(document.body, <body><Comp /></body>)
    })

    // it('Lab: Updatable does not work', () => {

    //     function Updateable({ h }: { h: H }) { return () => h }

    //     let n = 5
    //     let h = <body><Updateable h={n} /></body>

    //     patch(document.body, h)
    //     expect(document.body.outerHTML).toBe('<body>5</body>')

    //     n = 7
    //     patch(document.body, h)
    //     expect(document.body.outerHTML).toBe('<body>5</body>')
    // });
})