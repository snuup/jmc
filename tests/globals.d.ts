// the tests inspect what jmc attaches to rendered nodes. jmc keeps that typing module-local, the tests restore it here
import type { HElement, HComp, J } from '../src'

declare global {
    interface Node {
        h?: HElement | HComp
        ep?: J
    }
}
