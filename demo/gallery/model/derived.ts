import { m } from './model'

/** the state of the master checkbox: all, none or some of the categories are checked */
export const checkedstate = (): boolean | 'mixed' => {
    const n = m.categories.filter(c => m.checked[c]).length
    return n == 0 ? false : n == m.categories.length ? true : 'mixed'
}
