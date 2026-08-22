import { jsx, patch, When } from "@snupo/jmc"
import { describe, it } from "vitest"

describe('jmc library tests', () => {

    it('When true', () => {

        let Comp = () => <When cond={true}><div>here goes</div></When>

        patch(document.body, <body><Comp /></body>)
    })

    it('When false', () => {

        let Comp = () => <When cond={false}><div>here goes</div></When>

        patch(document.body, <body><Comp /></body>)
    })
})