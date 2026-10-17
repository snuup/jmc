import { H, jsx, patch, When } from "../src"
import { describe, expect, it } from "vitest"

describe('jmc library tests', () => {

    it('When true', () => {

        let Comp = () => <When cond={true}><div>here goes</div></When>

        patch(document.body, <body><Comp /></body>)
        expect(document.body.innerHTML).toBe('<div>here goes</div>')
    })

    it('When false', () => {

        let Comp = () => <When cond={false}><div>here goes</div></When>

        patch(document.body, <body><Comp /></body>)
        expect(document.body.innerHTML).toBe('')
    })
})