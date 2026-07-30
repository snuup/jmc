import { beforeEach, describe, expect, it, test, vitest } from 'vitest'
import { jsx, patch, updateview } from '../src';
import { Window } from 'happy-dom'

beforeEach(() => {
    const window = new Window({ url: "http://localhost/" })
    window.document.documentElement.innerHTML = `<html><body></body></html>`
    // @ts-expect-error assigning globals
    globalThis.window = window
    // @ts-expect-error assigning globals
    globalThis.document = window.document
})

describe('function components', () => {

    test('creates correct html', () => {

        let F = () => <div><b>bunny</b></div>

        patch(document.body, <body><F /></body>)

        expect(document.body.outerHTML).toBe('<body><div><b>bunny</b></div></body>')
    });

    test('updates correct html', () => {

        let name = "buster"
        let F = () => <div><b>{name} bunny</b></div>

        patch(document.body, <body><F /></body>)
        expect(document.body.outerHTML).toBe('<body><div><b>buster bunny</b></div></body>')

        name = "babsi"
        updateview("b")
        expect(document.body.outerHTML).toBe('<body><div><b>babsi bunny</b></div></body>')
    });

})