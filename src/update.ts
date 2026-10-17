import { updateview } from './jmc.js'
import type { Command } from './jmc'
import type { J, Selector } from './h'

// one queued update: a target with the depth and update context of the call that queued it
type Pending = [target: Selector, depth: number, uc: J | undefined]

let pendings: Pending[] = []
let isScheduled = false

/** resolves a call's commands into pendings, so depth and uc stay with their own call */
let enqueue = (cmds: Command[]) => {
    if (!cmds.length) cmds = ['body'] // like updateview()
    let depth = 999
    let uc: J | undefined
    for (const c of cmds)
        if (typeof c == 'number') depth = c
        else if (typeof c == 'string' || c instanceof Node) pendings.push([c, depth, uc])
        else uc = c
}

/** synchronously runs all queued updates. selectors are resolved now, and each node is updated once per depth and uc */
export const flush = (): void => {
    isScheduled = false
    const ps = pendings
    pendings = []
    const done: Pending[] = []
    for (const [target, depth, uc] of ps)
        for (const n of typeof target == 'string' ? document.querySelectorAll(target) : [target])
            if (!done.some(([t, d, u]) => t == n && d == depth && u == uc)) {
                done.push([n, depth, uc])
                updateview(depth, uc ?? {}, n)
            }
}

/** queues the update and schedules a flush, so that all calls before it collapse into one batch */
let batch = (schedule: (f: () => void) => void) => (...cmds: Command[]): void => {
    enqueue(cmds)
    if (!isScheduled) {
        isScheduled = true
        schedule(flush)
    }
}

/** batches updates until the next microtask */
export const updateviewmicro = batch(f => queueMicrotask(f))

/** batches updates until the next animation frame */
export const updateviewaf = batch(f => requestAnimationFrame(f)) // looked up on call, so importing works without a DOM

/** updates immediately, together with all queued updates */
export const updateviewsync = (...cmds: Command[]): void => {
    enqueue(cmds)
    flush()
}
