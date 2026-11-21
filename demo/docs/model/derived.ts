import { m } from './model'

/** the state of the master checkbox: all, none or some of the items are checked */
export const checkedstate = (): boolean | 'mixed' => {
    const v = Object.values(m.checkbox.items)
    const n = v.filter(Boolean).length
    return n == 0 ? false : n == v.length ? true : 'mixed'
}
