//#region ../jmc/dist/index.mjs
function rebind(o, proto = Object.getPrototypeOf(o)) {
	Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([name, p]) => name != "constructor" && p.value instanceof Function).forEach(([name]) => o[name] = o[name].bind(o));
	return o;
}
function mount(o) {
	Object.assign(globalThis, o);
}
function closestby(e, pred) {
	return e == null || pred(e) ? e : closestby(e.parentNode, pred);
}
function createElement(tag) {
	let ns = window.jmx?.getnamespace?.(tag);
	return ns ? document.createElementNS(ns, tag) : document.createElement(tag);
}
var evaluate = (expr) => expr instanceof Function ? expr() : expr;
var removeexcesschildren = (n, i) => {
	let c;
	while (c = n.childNodes[i]) try {
		c.remove();
	} catch (_) {}
};
var iswebcomponent = (h) => h.tag.includes("-");
var isclasscomponent = (h) => h.tag?.prototype?.view;
var iselement = (h) => typeof h.tag == "string";
var isfragment = (h) => {
	return h.tag == void 0 && h.cn != void 0;
};
var isobject = (o) => typeof o === "object";
var isproperty = (e, name, value) => name in e || value instanceof Object || value instanceof Function;
var setprops = (e, newprops = {}) => {
	let oldprops = evaluate(e.h?.p) ?? {};
	for (let p in oldprops) {
		let v = oldprops[p];
		if (!(p in newprops)) if (isproperty(e, p, oldprops[p])) e[p] = typeof v === "boolean" ? false : "";
		else e.removeAttribute(p);
		for (let p in newprops) isproperty(e, p, newprops[p]) ? e[p] = newprops[p] : e.setAttribute(p, newprops[p]);
	}
};
/** syncs at position i of p. returns the number of the element past the last added element.
* if no element was added (eg when h=null) then it returns i
* if a fragment with 5 nodes was added, it returns i + 5
* when a single element or component is added, it is i+1 since they always create exactly 1 node
*/
function sync(p, i, h) {
	h = evaluate(h);
	if (h === null || h === void 0) return i;
	let c = p.childNodes[i];
	function synctextnode(text) {
		if (c && c.nodeType == 3) {
			if (c.textContent != text) c.textContent = text;
		} else {
			let tn = document.createTextNode(text);
			c ? c.replaceWith(tn) : p.appendChild(tn);
		}
	}
	if (isobject(h)) {
		if (isfragment(h)) return syncchildren(p, h, i);
		const props = evaluate(h.p);
		if (iselement(h)) {
			let n;
			if (c?.tagName?.toLowerCase() != h.tag.toLowerCase()) {
				n = createElement(h.tag);
				c ? c.replaceWith(n) : p.appendChild(n);
				setprops(n, props);
				props?.mounted?.(n);
			} else {
				n = c;
				setprops(n, props);
				if (props?.update?.(c, globaluc)) return i + 1;
			}
			if (!globaluc.patchElementOnly && !iswebcomponent(h)) {
				const j = syncchildren(n, h, 0);
				removeexcesschildren(n, j);
			}
			return i + 1;
		}
		switch (typeof h.tag) {
			case "function":
				let isupdate = c?.h?.tag == h.tag;
				let ci;
				if (isclasscomponent(h)) {
					h.i = ci = isupdate ? c.h?.i : rebind(new h.tag(props));
					ci.props = props;
					if (isupdate && ci.update(globaluc)) return i + 1;
				}
				let hr = ci?.view ? ci?.view() : h.tag(props, evaluate(h.cn));
				if (hr === void 0 || hr == null) return i;
				let j = sync(p, i, hr);
				let cn = p.childNodes[i];
				if (cn) cn.h = h;
				cn.setAttribute?.("comp", "");
				if (ci) ci.element = cn;
				if (!isupdate) ci?.mounted?.();
				return j;
			case "object": return sync(p, i, h.tag);
		}
	}
	synctextnode(h);
	return i + 1;
}
/** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
function syncchildren(p, h, i) {
	evaluate(h.cn)?.flat().forEach((hc) => i = sync(p, i, hc));
	return i;
}
var globaluc = {};
function patch(e, h) {
	if (!e) return;
	if (globaluc.replace) e.replaceChildren();
	const p = e.parentElement;
	sync(p, [].indexOf.call(p.childNodes, e), h);
}
function updateview(...sels) {
	globaluc = {};
	updateviewinternal(...sels);
}
function updateviewinternal(...sels) {
	if (!sels.length) sels.push("body");
	sels.flatMap((s) => typeof s == "string" ? [...document.querySelectorAll(s)] : s ? [s] : []).forEach((e) => {
		let comp = closestby(e, (ee) => !!ee.h);
		if (!comp) throw "no parent component found";
		patch(comp, comp.h);
	});
}
function jsx(tag, p, ...cn) {
	return {
		tag,
		p: p ?? {},
		cn
	};
}
function jsxf(...cn) {
	return { cn };
}
//#endregion
//#region app.tsx
var m = {
	x: 41,
	name: "m-name"
};
var Hase = jsx(jsxf, null, jsx("div", null, "1"), jsx("div", null, "2"), jsx("div", null, "3"));
var X = () => jsx("a", null);
console.log(X);
var App2 = () => jsx("body", null, jsx("counter", { name: "carotts" }), jsx(Hase, null));
patch(document.body, jsx(App2, null));
mount({
	m,
	updateview
});
window.ondblclick = () => {
	console.log("dbl");
	m.x = 7788;
	updateview("div");
};
//#endregion
