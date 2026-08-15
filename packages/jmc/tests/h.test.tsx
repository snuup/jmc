import {
    jsx,
    jsxf,
    HElement,
    HKind,
    HFragment,
    HClassComponent,
    HFunctionComponent,
} from '../src/index'
import { describe, expect, it } from 'vitest'

describe('jsx hyperscript', () => {
    it('HElement empty', () => {
        let h: HElement = <div />

        let e = {
            kind: HKind.Element,
            tag: 'div',
        }

        expect(h).toEqual(e)
    })

    it('HElement with properties', () => {
        let h: HElement = <div class='red' title='snup' />

        let e = {
            kind: HKind.Element,
            tag: 'div',
            p: {
                class: 'red',
                title: 'snup',
            },
        }

        expect(h).toEqual(e)
    })

    it('HElement with properties and children', () => {
        let h: HElement = (
            <div class='red' title='snup'>
                <b>boldy</b>
            </div>
        )

        let e = {
            kind: HKind.Element,
            tag: 'div',
            p: {
                class: 'red',
                title: 'snup',
            },
            cn: [
                {
                    kind: HKind.Element,
                    tag: 'b',
                    cn: ['boldy'],
                },
            ],
        }

        expect(h).toEqual(e)
    })

    it('HFragment empty', () => {
        let h: HFragment = <></>

        let e = {
            kind: HKind.Fragment,
        }

        expect(h).toEqual(e)
    })

    it('HFragment with children', () => {
        let h: HFragment = (
            <>
                <b>boldy</b>
            </>
        )

        let e = {
            kind: HKind.Fragment,
            cn: [
                {
                    kind: HKind.Element,
                    tag: 'b',
                    cn: ['boldy'],
                },
            ],
        }

        expect(h).toEqual(e)
    })

    it('HFragment nested', () => {
        let h: HFragment = (
            <>
                <></>
            </>
        )

        let e = {
            kind: HKind.Fragment,
            cn: [
                {
                    kind: HKind.Fragment,
                },
            ],
        }

        expect(h).toEqual(e)
    })

    it('HClassComponent ', () => {
        class C { }

        let h: HClassComponent = <C />

        let e = {
            kind: HKind.ClassComponent,
            tag: C,
        }

        expect(h).toEqual(e)
    })

    it('HClassComponent with props and children', () => {
        class C { }

        let h: HClassComponent = <C class='red'>hops</C>

        let e = {
            kind: HKind.ClassComponent,
            tag: C,
            p: { class: 'red' },
            cn: ['hops'],
        }

        expect(h).toEqual(e)
    })

    it('HFunctionComponent ', () => {
        function F() { }

        let h: HFunctionComponent = <F />

        let e = {
            kind: HKind.FunctionComponent,
            tag: F,
        }

        expect(h).toEqual(e)
    })

    it('HFunctionComponent with props and children', () => {
        function F() { }

        let h: HFunctionComponent = (
            <F class='red'>
                <i>italy</i>
            </F>
        )

        let e = {
            kind: HKind.FunctionComponent,
            tag: F,
            p: { class: 'red' },
            cn: [
                {
                    kind: HKind.Element,
                    tag: 'i',
                    cn: ['italy'],
                },
            ],
        }

        expect(h).toEqual(e)
    })

    it('jsx 1', () => {
        let F = ({ a }: { a: number[] }) => (
            <>
                {a.map((x) => (
                    <div>{x}</div>
                ))}
            </>
        )

        let h = (
            <body>
                <F a={[1, 2, 3]} />
            </body>
        )

        let e = {
            kind: HKind.Element,
            tag: 'body',
            cn: [
                {
                    kind: HKind.FunctionComponent,
                    tag: F,
                    p: {
                        a: [1, 2, 3],
                    },
                },
            ],
        }

        expect(h).toEqual(e)
    })

    it('adhoc 1', () => {
        let F = <>
            <b>1</b>
            <b>2</b>
        </>

        let h = <body>
            <F />
        </body>

        let f_is = jsx(jsxf, null, jsx('b', null, '1'), jsx('b', null, '2'))
        let h_is = jsx('body', null, jsx(f_is, null))

        let e = {
            kind: 1,
            tag: 'body',
            cn: [
                {
                    kind: 4,
                    cn: [
                        { kind: 1, tag: 'b', cn: ['1'] },
                        { kind: 1, tag: 'b', cn: ['2'] },
                    ],
                },
            ],
        }

        // test implementation
        expect(h).toEqual(e)
    })

    it('adhoc 2', () => {

        let F = <>hasen</>
        let G = (
            <>
                <F />
            </>
        )
        let h = (
            <body>
                <G />
                hopp
            </body>
        )

        // simple jsx -> js transform
        // let f_is = jsx(jsxf, null, 'hasen')
        // let g_is = jsx(jsxf, null, jsx(f_is, null))
        // let h_is = jsx('body', null, jsx(g_is, null), 'hopp')

        // // jsx transform as ocx does it with builtin ast folding
        // let hh = jsx(
        //     'body',
        //     null,
        //     jsx(jsx(jsxf, null, jsx(jsx(jsxf, null, 'hasen'), null)), null),
        //     'hopp',
        // )

        console.dir(h, { depth: null });

        let e = {
            kind: 1,
            tag: 'body',
            cn: [
                {
                    kind: 4,
                    cn: [{ kind: 4, cn: ['hasen'] }]
                },
                'hopp'
            ]
        }

        expect(h).toEqual(e)
    })
})
