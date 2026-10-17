export function rebind<T extends object>(o: T, proto = Object.getPrototypeOf(o)): T {
    Object.entries(Object.getOwnPropertyDescriptors(proto))
        .filter(([name, p]) => name != 'constructor' && p.value instanceof Function)
        .forEach(([name]) => (o as any)[name] = (o as any)[name].bind(o))
    return o
}

/** wraps o so that each method call is reported to logger, after the method returned */
export const loggedmethodsex = <T extends Record<string, any>>(o: T, logger: (name: string, args: any[], result: any) => void) => new Proxy(o, {
    get(target, name: string, receiver) {
        if (typeof target[name] !== 'function') return Reflect.get(target, name, receiver)
        return function (this: T, ...args: any[]) {
            let result = target[name].apply(this, args)
            logger(name, args, result)
            return result
        }
    },
})

export const loggedmethodscolored = <T extends Record<string, any>>(bgcolor: string, o: T): T => loggedmethodsex(o, (name, args, result) => console.log('%c' + name, `background:${bgcolor};color:white;padding:2px;font-weight:bold`, args, result))

export const loggedmethods = <T extends Record<string, any>>(o: T): T => loggedmethodscolored('#585059', o)

export function closestby(e: Node | null, pred: (e: Node) => boolean): Node | null { return (e == null || pred(e)) ? e : closestby(e.parentNode, pred) }

export function lazy<T>(f: () => T) { (f as any).thunk = 1; return f }

export function mount(o: Record<string, any>) { Object.assign(globalThis, o) }