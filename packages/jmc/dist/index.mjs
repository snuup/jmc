//#region src/base.ts
function rebind(o, proto = Object.getPrototypeOf(o)) {
	Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([name, p]) => name != "constructor" && p.value instanceof Function).forEach(([name]) => o[name] = o[name].bind(o));
	return o;
}
let isobject = (o) => typeof o === "object";
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
//#region src/h.ts
let HKind = /* @__PURE__ */ function(HKind) {
	HKind[HKind["Element"] = 1] = "Element";
	HKind[HKind["FunctionComponent"] = 2] = "FunctionComponent";
	HKind[HKind["ClassComponent"] = 3] = "ClassComponent";
	HKind[HKind["Fragment"] = 4] = "Fragment";
	return HKind;
}({});
let isclass = (X) => /^class\s|^class\{/.test(X.toString());
function jsx(tag, p, ...cn) {
	if (tag == jsxf) return {
		kind: 4,
		...cn?.length ? { cn } : {}
	};
	else if (tag instanceof Function) return {
		kind: isclass(tag) ? 3 : 2,
		tag,
		...p ? { p } : {},
		...cn?.length ? { cn } : {}
	};
	else if (tag.kind) return tag;
	else return {
		kind: 1,
		tag,
		...p ? { p } : {},
		...cn?.length ? { cn } : {}
	};
}
function jsxf(props, ...cn) {
	throw 2;
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
let isproperty = (e, name, value) => name in e || value instanceof Object || value instanceof Function;
let setprops = (e, newprops = {}) => {
	let oldprops = e.p;
	for (let p in oldprops) if (!(p in newprops)) isproperty(e, p, oldprops[p]) ? e[p] = typeof oldprops[p] === "boolean" ? false : "" : e.removeAttribute(p);
	for (let p in newprops) isproperty(e, p, newprops[p]) ? e[p] = newprops[p] : e.setAttribute(p, newprops[p]);
	e.p = newprops;
};
function sync(uc, parent, i, he, ns) {
	/** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
	function syncchildren(p, cn, i, ns) {
		cn.flat().forEach((hc) => i = sync(uc, p, i, hc, ns));
		return i;
	}
	if (he === null || he === void 0) return i;
	let c = parent.childNodes[i];
	let h = evaluate(he);
	if (isobject(h)) switch (h.kind) {
		case 1:
			let n;
			let { tag, p, cn } = h;
			p ??= {};
			cn ??= [];
			if (c?.tagName?.toLowerCase() != tag.toLowerCase()) {
				ns = p.xmlns ?? ns;
				n = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
				c ? c.replaceWith(n) : parent.appendChild(n);
				setprops(n, p);
				p?.mounted?.(n);
			} else {
				n = c;
				setprops(n, p);
				if (p?.update?.(c, uc)) return i + 1;
			}
			n.h = he;
			if (!uc.patchElementOnly && !iswebcomponent(h)) {
				const j = syncchildren(n, cn, 0, ns);
				removeexcesschildren(n, j);
			}
			return i + 1;
		case 4: return syncchildren(parent, h.cn ?? [], i, ns);
		case 2: {
			let { tag, p, cn } = h;
			p ??= {};
			cn ??= [];
			let j = sync(uc, parent, i, tag(h.p, h.cn), ns);
			let n = parent.childNodes[i];
			if (n) n.h = he;
			return j;
		}
		case 3: {
			let isupdate = c?.h == h;
			let { tag, p, cn } = h;
			p ??= {};
			cn ??= [];
			h.i = isupdate ? h.i : rebind(new tag(h.p));
			h.i.props = h.p;
			if (isupdate && h.i.update(uc)) return i + 1;
			let j = sync(uc, parent, i, h.i.view(), ns);
			let n = parent.childNodes[i];
			if (n) n.h = he;
			h.i.element = n;
			if (!isupdate) h.i?.mounted?.();
			return j;
		}
	}
	else {
		let s = h;
		if (c?.nodeType == 3) {
			if (c.textContent != s) c.textContent = s;
		} else c ? c.replaceWith(s) : parent.append(s);
		return i + 1;
	}
	return 0;
}
function patch(e, h, uc = {}) {
	if (!e) return;
	delete uc.patchElementOnly;
	if (uc.replace) e.replaceChildren();
	const p = e.parentElement;
	sync(uc, p, [].indexOf.call(p.childNodes, e), h);
}
function updateviewuc(u, ...sels) {
	updateviewinternal(u, ...sels);
}
function updateview(...sels) {
	updateviewinternal({}, ...sels);
}
function updateviewinternal(uc, ...sels) {
	if (!sels.length) sels.push("body");
	sels.flatMap((s) => typeof s == "string" ? [...document.querySelectorAll(s)] : s ? [s] : []).forEach((e) => {
		patch(e, e.h, uc);
	});
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
export { HKind, JMXComp, When, cc, closestby, isobject, jsx, jsxf, loggedmethods, loggedmethodscolored, loggedmethodsex, mount, patch, rebind, updateview, updateviewuc };

//# sourceMappingURL=index.mjs.map