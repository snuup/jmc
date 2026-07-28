//#region src/base.ts
function rebind(o, proto = Object.getPrototypeOf(o)) {
	Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([name, p]) => name != "constructor" && p.value instanceof Function).forEach(([name]) => o[name] = o[name].bind(o));
	return o;
}
function mount(o) {
	Object.assign(globalThis, o);
}
const loggedmethodsex = (o, logger) => new Proxy(o, { get(target, name, receiver) {
	if (typeof target[name] === "function") return function(...args) {
		logger(name, args, void 0);
		return target[name].apply(this, args);
	};
	return Reflect.get(target, name, receiver);
} });
const loggedmethods = (o) => loggedmethodsex(o, (name, args, result) => console.log("%c" + name, "background:#585059;color:white;padding:2px;font-weight:bold", args));
const loggedmethodscolored = (bgcolor, o) => loggedmethodsex(o, (name, args, result) => console.log("%c" + name, `background:${bgcolor};color:white;padding:2px;font-weight:bold`, args));
function closestby(e, pred) {
	return e == null || pred(e) ? e : closestby(e.parentNode, pred);
}
//#endregion
//#region src/jmc.ts
let removeexcesschildren = (n, i) => {
	let c;
	while (c = n.childNodes[i]) try {
		c.remove();
	} catch (_) {}
};
let evaluate = (expr) => expr instanceof Function ? expr() : expr;
let iswebcomponent = (h) => h.tag.includes("-");
let isclasscomponent = (h) => h.tag?.prototype?.view;
let iselement = (h) => typeof h.tag == "string";
let isfragment = (h) => {
	return h.tag == void 0;
};
let isfragmentfunction = (h) => {
	return h.tag == jsxf;
};
let isobject = (o) => typeof o === "object";
let isproperty = (e, name, value) => name in e || value instanceof Object || value instanceof Function;
let setprops = (e, newprops = {}) => {
	let oldprops = e.h?.p;
	for (let p in oldprops) if (!(p in newprops)) isproperty(e, p, oldprops[p]) ? e[p] = typeof oldprops[p] === "boolean" ? false : "" : e.removeAttribute(p);
	for (let p in newprops) isproperty(e, p, newprops[p]) ? e[p] = newprops[p] : e.setAttribute(p, newprops[p]);
};
/** syncs at position i of p. returns the number of the element past the last added element.
* if no element was added (eg when h=null) then it returns i
* if a fragment with 5 nodes was added, it returns i + 5
* when a single element or component is added, it is i+1 since they always create exactly 1 node
*/
function sync(p, i, h, ns) {
	console.log("%csync", "background:orange", p.tagName, i, h, ns);
	if (h === null || h === void 0) return i;
	let c = p.childNodes[i];
	let horiginal = h;
	h = evaluate(h);
	if (isobject(h)) {
		if (isfragment(h)) return syncchildren(p, h, i, ns);
		const props = h.p;
		if (iselement(h)) {
			let n;
			if (c?.tagName?.toLowerCase() != h.tag.toLowerCase()) {
				ns = props.xmlns ?? ns;
				n = ns ? document.createElementNS(ns, h.tag) : document.createElement(h.tag);
				c ? c.replaceWith(n) : p.appendChild(n);
				setprops(n, props);
				props?.mounted?.(n);
			} else {
				n = c;
				setprops(n, props);
				if (props?.update?.(c, globaluc)) return i + 1;
			}
			n.h = horiginal;
			if (!globaluc.patchElementOnly && !iswebcomponent(h)) {
				const j = syncchildren(n, h, 0, ns);
				removeexcesschildren(n, j);
			}
			return i + 1;
		}
		switch (typeof h.tag) {
			case "function":
				let isupdate = c?.h?.tag == h.tag;
				let hr;
				if (isclasscomponent(h)) {
					h.i = isupdate ? h.i : rebind(new h.tag(props));
					h.i.props = props;
					if (isupdate && h.i.update(globaluc)) return i + 1;
					hr = h.i.view();
				} else hr = h.tag(props, h.cn);
				let j = sync(p, i, hr, ns);
				let cn = p.childNodes[i];
				if (cn && !isfragmentfunction(h)) cn.h = horiginal;
				if (isclasscomponent(h)) {
					h.i.element = cn;
					if (!isupdate) h.i?.mounted?.();
				}
				return j;
			case "object": return sync(p, i, h.tag, ns);
			default: throw "1";
		}
	} else {
		let s = h;
		if (c?.nodeType == 3) {
			if (c.textContent != s) c.textContent = s;
		} else c ? c.replaceWith(s) : p.append(s);
		return i + 1;
	}
}
/** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
function syncchildren(p, h, i, ns) {
	h.cn?.flat().forEach((hc) => i = sync(p, i, hc, ns));
	return i;
}
let globaluc = {};
function patch(e, h) {
	if (!e) return;
	if (globaluc.replace) e.replaceChildren();
	const p = e.parentElement;
	sync(p, [].indexOf.call(p.childNodes, e), h);
}
function updateviewuc(uc, ...sels) {
	globaluc = uc;
	updateviewinternal(...sels);
}
function updateview(...sels) {
	globaluc = {};
	updateviewinternal(...sels);
}
function updateviewinternal(...sels) {
	if (!sels.length) sels.push("body");
	sels.flatMap((s) => typeof s == "string" ? [...document.querySelectorAll(s)] : s ? [s] : []).forEach((e) => {
		patch(e, e.h);
	});
}
function jsx(tag, p, ...cn) {
	p ??= {};
	return {
		tag,
		p,
		cn
	};
}
function jsxf(props, ...cn) {
	return { cn };
}
//#endregion
//#region src/lib.ts
const When = ({ cond }, cn) => cond ? { cn } : void 0;
var JMXComp = class {
	props;
	element;
	constructor(props) {
		this.props = props;
	}
	mounted() {}
	update(uc) {}
	updateview() {
		updateview(this.element);
	}
	get ismounted() {
		return this.element;
	}
};
function cc(...namesOrObjects) {
	return namesOrObjects.flatMap((n) => n.trim ? n : Object.keys(n).filter((k) => n[k])).join(" ");
}
//#endregion
export { JMXComp, When, cc, closestby, jsx, jsxf, loggedmethods, loggedmethodscolored, loggedmethodsex, mount, patch, rebind, updateview, updateviewuc };

//# sourceMappingURL=index.mjs.map