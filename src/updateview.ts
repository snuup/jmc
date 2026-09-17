import { Command, updateview } from "./jmc"

let pendings: Command[] = []
let isScheduled = false

/**
 * Synchronously processes all pending commands queued in pendingCommands.
 */
export const flush = (): void => {
    if (pendings.length === 0) return

    // Clear scheduling state and extract queued commands
    isScheduled = false
    const cmds = [...new Set(pendings)] // this is guaranteed stable, keeping order
    pendings = []

    // Execute the single, unified update
    updateview(...cmds)
}

/**
 * Asynchronously batches view updates.
 * Multiple synchronous calls collapse into a single execution during the microtask queue tick.
 */
export const updateviewmicro = (...args: Command[]): void => {
    pendings.push(...args)
    if (!isScheduled) {
        isScheduled = true
        queueMicrotask(flush)
    }
}

export const updateviewaf = (...args: Command[]): void => {
    pendings.push(...args)
    if (!isScheduled) {
        isScheduled = true
        requestAnimationFrame(flush)
    }
}

/**
 * Synchronously updates the view immediately.
 * Pushes new commands onto the queue and flushes all pending commands in a single batch.
 */
export const updateviewsync = (...args: Command[]): void => {
    pendings.push(...args)
    flush()
}
