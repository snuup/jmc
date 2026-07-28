function e(e, t = Object.getPrototypeOf(e)) {
    return (
        Object.entries(Object.getOwnPropertyDescriptors(t))
            .filter(([e, t]) => e != `constructor` && t.value instanceof Function)
            .forEach(([t]) => (e[t] = e[t].bind(e))),
        e
    )
}
var t = (e, t) => {
        let n
        for (; (n = e.childNodes[t]); )
            try {
                n.remove()
            } catch {}
    },
    n = e => e.tag.includes(`-`),
    r = e => e.tag?.prototype?.view,
    i = e => typeof e.tag == `string`,
    a = e => e.tag == null,
    o = e => e.tag == _,
    s = e => typeof e == `object`,
    c = (e, t, n) => t in e || n instanceof Object || n instanceof Function,
    l = (e, t = {}) => {
        let n = e.h?.p
        for (let r in n) r in t || (c(e, r, n[r]) ? (e[r] = typeof n[r] != `boolean` && ``) : e.removeAttribute(r))
        for (let n in t) c(e, n, t[n]) ? (e[n] = t[n]) : e.setAttribute(n, t[n])
    }
function u(c, p, m, h) {
    if ((console.log(`%csync`, `background:orange`, c.tagName, p, m, h), m == null)) return p
    let g = c.childNodes[p]
    if (s(m)) {
        if (a(m)) return d(c, m, p, h)
        let s = m.p
        if (i(m)) {
            let e
            if (g?.tagName?.toLowerCase() != m.tag.toLowerCase())
                ((h = s.xmlns ?? h),
                    (e = h ? document.createElementNS(h, m.tag) : document.createElement(m.tag)),
                    g ? g.replaceWith(e) : c.appendChild(e),
                    l(e, s),
                    s?.mounted?.(e))
            else if (((e = g), l(e, s), s?.update?.(g, f))) return p + 1
            if (((e.h = m), !f.patchElementOnly && !n(m))) {
                let n = d(e, m, 0, h)
                t(e, n)
            }
            return p + 1
        }
        switch (typeof m.tag) {
            case `function`:
                let t = g?.h?.tag == m.tag,
                    n
                if (r(m)) {
                    if (((m.i = t ? m.i : e(new m.tag(s))), (m.i.props = s), t && m.i.update(f))) return p + 1
                    n = m.i.view()
                } else n = m.tag(s, m.cn)
                let i = u(c, p, n, h),
                    a = c.childNodes[p]
                return (a && !o(m) && (a.h = m), r(m) && ((m.i.element = a), t || m.i?.mounted?.()), i)
            case `object`:
                return u(c, p, m.tag, h)
            default:
                throw `1`
        }
    } else {
        let e = m
        return (
            g?.nodeType == 3 ? g.textContent != e && (g.textContent = e) : g ? g.replaceWith(e) : c.append(e),
            p + 1
        )
    }
}
function d(e, t, n, r) {
    return (t.cn?.flat().forEach(t => (n = u(e, n, t, r))), n)
}
var f = {}
function p(e, t) {
    if (!e) return
    f.replace && e.replaceChildren()
    let n = e.parentElement
    u(n, [].indexOf.call(n.childNodes, e), t)
}
function m(...e) {
    ;((f = {}), h(...e))
}
function h(...e) {
    ;(e.length || e.push(`body`),
        e
            .flatMap(e => (typeof e == `string` ? [...document.querySelectorAll(e)] : e ? [e] : []))
            .forEach(e => {
                p(e, e.h)
            }))
}
function g(e, t, ...n) {
    return ((t ??= {}), { tag: e, p: t, cn: n })
}
function _(e, ...t) {
    return { cn: t }
}
var v = ({ cond: e }, t) => (e ? { cn: t } : void 0)
function y(...e) {
    return e.flatMap(e => (e.trim ? e : Object.keys(e).filter(t => e[t]))).join(` `)
}
var b = {
        items: [{ id: `123`, completed: !1, text: `hasentodo` }],
        editingItem: null,
        filter: `all`,
        get filtereditems() {
            switch (this.filter) {
                case `all`:
                    return this.items
                case `active`:
                    return this.activeitems
                case `completed`:
                    return this.items.filter(e => e.completed)
            }
        },
        get activeitems() {
            return this.items.filter(e => !e.completed)
        },
        get activecount() {
            return this.activeitems.length
        },
        get allarecompleted() {
            return this.items.every(e => e.completed)
        },
        get anycompleted() {
            return this.items.some(e => e.completed)
        },
    },
    x = b,
    S = new (class {
        constructor() {
            ;(e(this), window.addEventListener(`hashchange`, this.setroute))
        }
        setroute() {
            ;((b.filter = { '#/active': `active`, '#/completed': `completed` }[window.location.hash] ?? `all`),
                m(`.main`))
        }
        removeCompletedItems() {
            ;((b.items = b.items.filter(e => !e.completed)), m(`main`))
        }
        startEdit(e, t) {
            ;((b.editingItem = t), m(e.target.closest(`li`)))
        }
        endEdit(e) {
            ;((b.editingItem = null), m(e.target.closest(`li`)))
        }
        keyUp(e) {
            let {
                    key: t,
                    target: { value: n },
                } = e,
                r = b.editingItem
            switch (t) {
                case `Enter`:
                    ;((r.text = n), n || (b.items = b.items.filter(e => e !== r)), this.endEdit(e))
                    break
                case `Escape`:
                    this.endEdit(e)
                    break
            }
        }
        setCompleted(e, t) {
            ;((t.completed = e.target.checked), m(`.footer`, e.target.closest(`li`)))
        }
        toggleAllItems(e) {
            let t = e.target.checked
            ;(b.items.forEach(e => (e.completed = t)), m(`ul`))
        }
        keydown(e) {
            if (e.key === `Enter`) {
                let t = e.target,
                    { value: n } = t
                ;((n = n.trim()),
                    n.length && (b.items.push({ id: crypto.randomUUID(), text: n, completed: !1 }), (t.value = ``)))
            }
            m(`ul`)
        }
        delItem(e) {
            ;((b.items = b.items.filter(t => t.id != e.id)), m(`ul`))
        }
    })(),
    C = g(
        `header`,
        { class: `header` },
        g(`h1`, null, `todos`),
        g(`input`, { class: `new-todo`, onkeydown: S.keydown, placeholder: `What needs to be done?`, autofocus: !0 }),
    ),
    w = g(
        `footer`,
        { class: `footer` },
        g(
            `span`,
            { class: `todo-count` },
            g(`strong`, null, x.activecount),
            ` `,
            x.activecount == 1 ? `item` : `items`,
            ` left`,
        ),
        g(
            `ul`,
            { class: `filters` },
            g(`li`, null, g(`a`, { class: y({ selected: x.filter == `all` }), href: `#/` }, `All`)),
            g(`li`, null, g(`a`, { class: y({ selected: x.filter == `active` }), href: `#/active` }, `Active`)),
            g(
                `li`,
                null,
                g(`a`, { class: y({ selected: x.filter == `completed` }), href: `#/completed` }, `Completed`),
            ),
        ),
        g(
            v,
            { cond: x.anycompleted },
            g(`button`, { class: `clear-completed`, onclick: S.removeCompletedItems }, `Clear completed`),
        ),
    ),
    T = ({ item: e }) => {
        let t = x.editingItem == e,
            n = e.completed
        return g(
            `li`,
            { class: y({ completed: n, editing: t }) },
            g(
                `div`,
                { class: `view` },
                g(`input`, { class: `toggle`, type: `checkbox`, onchange: t => S.setCompleted(t, e), checked: n }),
                g(`label`, { ondblclick: t => S.startEdit(t, e) }, e.text),
                g(`button`, { onclick: () => S.delItem(e), class: `destroy` }),
            ),
            g(
                v,
                { cond: t },
                g(
                    `div`,
                    { class: `input-container` },
                    g(`input`, {
                        id: `edit-todo-input`,
                        class: `edit`,
                        value: e.text,
                        onkeyup: S.keyUp,
                        onblur: S.endEdit,
                        mounted: e => e.focus(),
                    }),
                ),
            ),
        )
    },
    E = () =>
        g(
            `main`,
            { class: `main` },
            g(
                `div`,
                { class: `toggle-all-container` },
                g(`input`, {
                    class: `toggle-all`,
                    id: `toggle-all`,
                    type: `checkbox`,
                    onchange: S.toggleAllItems,
                    checked: x.allarecompleted,
                }),
                g(`label`, { for: `toggle-all` }, `Mark all as complete`),
            ),
            g(
                `ul`,
                { class: `todo-list` },
                x.filtereditems.map(e => g(T, { item: e })),
            ),
            g(w, null),
        )
p(document.querySelector(`.todoapp`), () => g(`section`, { class: `todoapp` }, g(C, null), g(E, null)))
