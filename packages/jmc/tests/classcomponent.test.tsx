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

describe('class components', () => {})