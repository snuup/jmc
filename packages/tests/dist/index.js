import { beforeEach, describe, expect, it } from "vitest";
//#region ../jmc/src/base.ts
function rebind(o, proto = Object.getPrototypeOf(o)) {
	Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([name, p]) => name != "constructor" && p.value instanceof Function).forEach(([name]) => o[name] = o[name].bind(o));
	return o;
}
function closestby(e, pred) {
	return e == null || pred(e) ? e : closestby(e.parentNode, pred);
}
//#endregion
//#region ../jmc/src/jmc.ts
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
	return h.tag == void 0;
};
var isfragmentfunction = (h) => {
	return h.tag == jsxf;
};
var isobject = (o) => typeof o === "object";
var isproperty = (e, name, value) => name in e || value instanceof Object || value instanceof Function;
var setprops = (e, newprops = {}) => {
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
	h = evaluate(h);
	if (h === null || h === void 0) return i;
	let c = p.childNodes[i];
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
			n.h = h;
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
				let ci;
				if (isclasscomponent(h)) {
					h.i = ci = isupdate ? c.h?.i : rebind(new h.tag(props));
					ci.props = props;
					if (isupdate && ci.update(globaluc)) return i + 1;
					hr = ci.view();
				} else if (!isfragmentfunction(h)) hr = h.tag(props, h.cn);
				else hr = jsxf(null, h.cn);
				if (hr === void 0 || hr == null) return i;
				let j = sync(p, i, hr, ns);
				let cn = p.childNodes[i];
				if (cn && !isfragmentfunction(h)) cn.h = h;
				if (ci) ci.element = cn;
				if (!isupdate) ci?.mounted?.();
				return j;
			case "object": throw "????????????????";
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
	evaluate(h.cn)?.flat().forEach((hc) => i = sync(p, i, hc, ns));
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
		let comp = closestby(e, (ee) => ee.h.tag instanceof Function);
		if (!comp) comp = e;
		patch(comp, comp.h);
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
//#region ../jmc/src/lib.ts
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
//#endregion
//#region jmc.test.tsx
beforeEach(() => {
	document.body.replaceChildren();
	document.body.getAttributeNames().forEach((a) => document.body.removeAttribute(a));
	window.requestAnimationFrame = (cb) => {
		cb(0);
		return 0;
	};
});
describe("JMX dom tests", () => {
	it("HTag 1", () => {
		var h = jsx("body", null, "hase");
		patch(document.body, h);
		expect(document.body.outerHTML).toBe("<body>hase</body>");
	});
	it("HTag 1 thunked", () => {
		var h = jsx("body", null, "hase");
		patch(document.body, h);
		expect(document.body.outerHTML).toBe("<body>hase</body>");
	});
	it("HTag 2", () => {
		let h = jsx("body", { class: "cc" }, "hase", 42, true, false);
		patch(document.body, h);
		expect(document.body.className).toBe("cc");
		expect(document.body.innerHTML).toBe("hase42truefalse");
	});
	it("HFunction", () => {
		let F = ({ x }) => jsx("div", { class: "classo" + x * 3 }, x * 2);
		let a = jsx("body", null, jsx(F, { x: 7 }));
		patch(document.body, a);
		expect(document.body.outerHTML).toBe("<body><div class=\"classo21\">14</div></body>");
	});
	it("clear styles after update", () => {
		patch(document.body, jsx("body", null, jsx("div", { class: "hase" }, "div")));
		expect(document.body.innerHTML).toBe("<div class=\"hase\">div</div>");
		patch(document.querySelector("div"), jsx("div", null, "snuff"));
		expect(document.body.innerHTML).toBe("<div>snuff</div>");
	});
	it("fragments", () => {
		let F = jsx(jsxf, null, jsx("b", null, "1"), jsx("b", null, "2"), jsx("b", null, "3"));
		patch(document.body, jsx("body", null, jsx(F, null)));
		expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b>");
	});
	it("fragment thunked", () => {
		let F = () => jsx(jsxf, null, jsx("b", null, "1"), jsx("b", null, "2"), jsx("b", null, "3"));
		patch(document.body, jsx("body", null, jsx(F, null)));
		expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b>");
	});
	it("fragments many", () => {
		let F = jsx(jsxf, null, jsx("b", null, "1"), jsx("b", null, "2"), jsx("b", null, "3"));
		patch(document.body, jsx("body", null, jsx(F, null), jsx(F, null)));
		expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b><b>1</b><b>2</b><b>3</b>");
	});
	it("element as object", () => {
		let D = jsx("div", null);
		patch(document.body, jsx("body", null, jsx(D, null)));
		expect(document.body.innerHTML).toBe("<div></div>");
	});
	it("element as thunked object", () => {
		let D = () => jsx("div", null);
		patch(document.body, jsx("body", null, jsx(D, null)));
		expect(document.body.innerHTML).toBe("<div></div>");
	});
	it("class component is constructed", () => {
		class C extends JMXComp {
			view() {
				return "bunny component";
			}
		}
		patch(document.body, jsx("body", null, jsx(C, null)));
		expect(document.body.innerHTML).toBe("bunny component");
	});
	it("class component h is attached", () => {
		class C extends JMXComp {
			view() {
				return jsx("div", null);
			}
		}
		patch(document.body, jsx("body", null, jsx(C, null)));
		expect(document.querySelector("div")?.h).toBeDefined();
		expect(document.body.innerHTML).toBe("<div></div>");
	});
	it("class component instance h.i is attached", () => {
		class C extends JMXComp {
			view() {
				return jsx("div", null);
			}
		}
		patch(document.body, jsx("body", null, jsx(C, null)));
		let h = document.querySelector("div")?.h;
		expect(h.i).toBeDefined();
	});
	it("fragments in context", () => {
		let A = jsx("div", null, jsx(jsx(jsxf, null, jsx("b", null, "1")), null), jsx("article", null), jsx("aside", null));
		patch(document.body, jsx("body", null, jsx(A, null)));
		expect(document.body.innerHTML).toBe("<div><b>1</b><article></article><aside></aside></div>");
	});
	it("fragments in context2", () => {
		let F = () => jsx(jsxf, null, jsx("b", null, "1"));
		let A = jsx("div", null, jsx(F, null), jsx("article", null), jsx("aside", null));
		patch(document.body, jsx("body", null, jsx(A, null)));
		expect(document.body.innerHTML).toBe("<div><b>1</b><article></article><aside></aside></div>");
	});
	it("patch class component", () => {
		class C extends JMXComp {
			view() {
				return jsx("aside", null, "hase war da");
			}
		}
		document.body.innerHTML = "<div />";
		patch(document.body.querySelector("div"), jsx(C, null));
		expect(document.body.innerHTML).toBe("<aside>hase war da</aside>");
	});
	it("svg autonamespace", () => {
		let h = jsx("div", null, jsx("circle", { id: "c1" }), jsx("svg", { xmlns: "http://www.w3.org/2000/svg" }, jsx("circle", { id: "c2" })));
		patch(document.body, h);
		let svg = document.querySelector("svg");
		expect(svg).toBeInstanceOf(SVGElement);
		expect(svg?.namespaceURI).toBe("http://www.w3.org/2000/svg");
		expect(document.getElementById("c1")?.namespaceURI).toBe("http://www.w3.org/1999/xhtml");
		expect(document.getElementById("c2")?.namespaceURI).toBe("http://www.w3.org/2000/svg");
	});
});
//#endregion
