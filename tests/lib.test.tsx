import { H, jsx, ls, patch, When } from "../src"
import { beforeEach, describe, expect, it, vi } from "vitest"

declare global {
    interface LocalStorage { settings: { dark: boolean } }
}

describe('ls: localStorage as an object', () => {

    // the test environment has no usable localStorage, so a minimal one stands in
    beforeEach(() => {
        const data = new Map<string, string>()
        vi.stubGlobal('localStorage', {
            getItem: (k: string) => data.get(k) ?? null,
            setItem: (k: string, v: string) => data.set(k, String(v)),
            removeItem: (k: string) => data.delete(k),
            clear: () => data.clear(),
        })
    })

    it('stores values as JSON and reads them back', () => {
        ls.user = { name: 'x', tags: ['a', 'b'] }
        ls.count = 3
        expect(localStorage.getItem('count')).toBe('3')
        expect(ls.user).toEqual({ name: 'x', tags: ['a', 'b'] })
        expect(ls.count).toBe(3)
    })

    it('a project types its keys by extending the global interface LocalStorage', () => {
        ls.settings = { dark: true }
        expect(ls.settings.dark).toBe(true)
        // @ts-expect-error the declared type of settings is checked
        ls.settings = 5
    })

    it('reads null for a missing key', () => {
        expect(ls.nothing).toBe(null)
    })

    it('sees what was written to localStorage directly', () => {
        localStorage.setItem('flag', 'true')
        expect(ls.flag).toBe(true)
    })

    it('assigning undefined removes the key, so it can be read again', () => {
        ls.x = 1
        ls.x = undefined
        expect(localStorage.getItem('x')).toBe(null)
        expect(ls.x).toBe(null)
    })

    it('delete removes the key', () => {
        ls.x = 1
        delete ls.x
        expect(localStorage.getItem('x')).toBe(null)
    })

    it('does not throw for symbols (console.log, inspection)', () => {
        expect(ls[Symbol.iterator as any]).toBe(undefined)
        expect(() => JSON.stringify(ls)).not.toThrow()
    })
})

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