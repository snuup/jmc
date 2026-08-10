(() => {
	var table = /* @__PURE__ */ new Uint8Array(128);
	for (var i = 0; i < 64; i++) table[i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i * 4 - 205] = i;
	return (base64) => {
		var n = base64.length, bytes = new Uint8Array((n - (base64[n - 1] == "=") - (base64[n - 2] == "=")) * 3 / 4 | 0);
		for (var i = 0, j = 0; i < n;) {
			var c0 = table[base64.charCodeAt(i++)], c1 = table[base64.charCodeAt(i++)];
			var c2 = table[base64.charCodeAt(i++)], c3 = table[base64.charCodeAt(i++)];
			bytes[j++] = c0 << 2 | c1 >> 4;
			bytes[j++] = c1 << 4 | c2 >> 2;
			bytes[j++] = c2 << 6 | c3;
		}
		return bytes;
	};
})();
((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
});
//#endregion
//#region ../jmc/src/base.ts
function rebind(o, proto = Object.getPrototypeOf(o)) {
	Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([name, p]) => name != "constructor" && p.value instanceof Function).forEach(([name]) => o[name] = o[name].bind(o));
	return o;
}
function mount(o) {
	Object.assign(globalThis, o);
}
//#endregion
//#region ../jmc/src/h.ts
var HKind = function(HKind) {
	HKind[HKind["Element"] = 1] = "Element";
	HKind[HKind["FunctionComponent"] = 2] = "FunctionComponent";
	HKind[HKind["ClassComponent"] = 3] = "ClassComponent";
	HKind[HKind["Fragment"] = 4] = "Fragment";
	return HKind;
}({});
var isclass = (X) => /^class\s|^class\{/.test(X.toString());
function jsx(tag, p, ...cn) {
	if (tag?.kind) return tag;
	let kind = tag == jsxf ? 4 : tag instanceof Function ? isclass(tag) ? 3 : 2 : 1;
	let h = { kind };
	if (kind != 4) h.tag = tag;
	if (p) h.p = p;
	if (cn?.length) h.cn = cn;
	return h;
}
function jsxf(props, ...cn) {
	throw 2;
}
//#endregion
//#region ../jmc/src/jmc.ts
var removeexcesschildren = (n, i) => {
	let c;
	while (c = n.childNodes[i]) try {
		c.remove();
	} catch (_) {}
};
var iswebcomponent = (h) => h.tag.includes("-");
var isproperty = (e, name, value) => name !== "viewBox" && (value instanceof Object || value instanceof Function || e.namespaceURI !== "http://www.w3.org/2000/svg" && name in e && name != "style");
var setprops = (e, old, now) => {
	old ??= {};
	now ??= {};
	for (let p in old) if (!(p in now)) isproperty(e, p, old[p]) ? e[p] = typeof old[p] === "boolean" ? false : "" : e.removeAttribute(p);
	for (let p in now) isproperty(e, p, now[p]) ? e[p] = now[p] : e.setAttribute(p, now[p]);
};
/** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
var syncchildren = (uc, p, cn, i, ns) => {
	cn.flat().forEach((hc) => i = sync(uc, p, i, hc, ns));
	return i;
};
function evalprops(p) {
	console.log("evalprops", p);
	if (p) {
		for (let k in p) if (p[k] instanceof Function) p[k] = p[k]();
	}
}
var lazy = (expr) => expr;
function sync(uc, parent, i, h, ns) {
	console.log("%csync2", "background:orange", parent.tagName, i, h);
	if (h === null || h === void 0) return i;
	let c = parent.childNodes[i];
	switch (h.kind) {
		case HKind.Element:
			let n;
			let { tag, cn, p } = h;
			cn ??= [];
			evalprops(p);
			if (c?.tagName?.toLowerCase() != tag.toLowerCase()) {
				n = document.createElementNS(ns = p?.xmlns ?? ns, tag);
				c ? c.replaceWith(n) : parent.appendChild(n);
				setprops(n, {}, p);
				p?.mounted?.(n);
			} else {
				n = c;
				setprops(n, n.h?.p, p);
				if (p?.update?.(c, uc)) return i + 1;
			}
			n.h = h;
			if (!uc.patchElementOnly && !iswebcomponent(h)) {
				const j = syncchildren(uc, n, cn, 0, ns);
				removeexcesschildren(n, j);
			}
			return i + 1;
		case HKind.Fragment: return syncchildren(uc, parent, h.cn ?? [], i, ns);
		case HKind.FunctionComponent: {
			let j = sync(uc, parent, i, h.tag(h.p, h.cn), ns);
			let n = parent.childNodes[i];
			if (n) n.h = h;
			return j;
		}
		case HKind.ClassComponent: {
			let isupdate = (c?.h)?.tag == h.tag;
			let ci = h.i = isupdate ? h.i : rebind(new h.tag(h.p));
			ci.props = h.p;
			if (isupdate && ci.update?.(uc)) return i + 1;
			let j = sync(uc, parent, i, ci.view(), ns);
			let n = parent.childNodes[i];
			if (n) n.h = h;
			ci.element = n;
			if (!isupdate) ci?.mounted?.();
			return j;
		}
		case void 0:
			let s = h;
			if (c?.nodeType == 3) {
				if (c.textContent != s) c.textContent = s;
			} else c ? c.replaceWith(s) : parent.append(s);
			return i + 1;
	}
}
function patch(e, h, uc = {}) {
	if (!e) return;
	delete uc.patchElementOnly;
	if (uc.replace) e.replaceChildren();
	const p = e.parentElement;
	sync(uc, p, [].indexOf.call(p.childNodes, e), h, p.namespaceURI);
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
//#region app.tsx
var m = {
	person: { name: "bugs" },
	name: "bugs"
};
mount({
	m,
	updateview
});
var Comp = ({ name }) => {
	console.log("Comp", name);
	return jsx("b", null, name);
};
var App = () => jsx("body", null, jsx(Comp, { name: lazy(() => m.name) }));
patch(document.body, jsx(App, null));
m.name = "duffy";
updateview("b");
//#endregion
