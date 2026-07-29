(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(require("vitest")) : typeof define === "function" && define.amd ? define(["vitest"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.vitest));
})(this, function(vitest) {
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
	function closestby(e, pred) {
		return e == null || pred(e) ? e : closestby(e.parentNode, pred);
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
	function jsx(tag, p, ...cn) {
		if (tag == jsxf) return {
			kind: 4,
			...cn?.length ? { cn } : {}
		};
		else if (tag instanceof Function) return /^class\s|^class\{/.test(tag.toString()) ? {
			kind: 3,
			tag,
			...p ? { p } : {},
			...cn?.length ? { cn } : {}
		} : {
			kind: 2,
			tag,
			...p ? { p } : {},
			...cn?.length ? { cn } : {}
		};
		else return {
			kind: 1,
			tag,
			...p ? { p } : {},
			...cn?.length ? { cn } : {}
		};
	}
	function jsxf(props, ...cn) {
		throw "never called";
	}
	//#endregion
	//#region ../jmc/src/jmc.ts
	var removeexcesschildren = (n, i) => {
		let c;
		while (c = n.childNodes[i]) try {
			c.remove();
		} catch (_) {}
	};
	var evaluate = (expr) => expr instanceof Function ? expr() : expr;
	var iswebcomponent = (h) => h.tag.includes("-");
	var isobject = (o) => typeof o === "object";
	var isproperty = (e, name, value) => name in e || value instanceof Object || value instanceof Function;
	var setprops = (e, newprops = {}) => {
		let oldprops = e.p;
		for (let p in oldprops) if (!(p in newprops)) isproperty(e, p, oldprops[p]) ? e[p] = typeof oldprops[p] === "boolean" ? false : "" : e.removeAttribute(p);
		for (let p in newprops) isproperty(e, p, newprops[p]) ? e[p] = newprops[p] : e.setAttribute(p, newprops[p]);
		e.p = newprops;
	};
	function sync(uc, parent, i, he, ns) {
		console.log("%csync2", "background:orange", parent.tagName, i, he, ns);
		/** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
		function syncchildren(p, cn, i, ns) {
			cn.flat().forEach((hc) => i = sync(uc, p, i, hc, ns));
			return i;
		}
		if (he === null || he === void 0) return i;
		let c = parent.childNodes[i];
		let h = evaluate(he);
		if (isobject(h)) switch (h.kind) {
			case HKind.Element:
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
			case HKind.Fragment: return syncchildren(parent, h.cn ?? [], i, ns);
			case HKind.FunctionComponent: {
				let { tag, p, cn } = h;
				p ??= {};
				cn ??= [];
				let j = sync(uc, parent, i, tag(h.p, h.cn), ns);
				let n = parent.childNodes[i];
				if (n) n.h = he;
				return j;
			}
			case HKind.ClassComponent: {
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
	//#endregion
	//#region h.test.tsx
	(0, vitest.describe)("jsx results", () => {
		(0, vitest.it)("HElement empty", () => {
			let h = jsx("div", null);
			let e = {
				kind: HKind.Element,
				tag: "div"
			};
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.it)("HElement with properties", () => {
			let h = jsx("div", {
				class: "red",
				title: "snup"
			});
			let e = {
				kind: HKind.Element,
				tag: "div",
				p: {
					class: "red",
					title: "snup"
				}
			};
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.it)("HElement with properties and children", () => {
			let h = jsx("div", {
				class: "red",
				title: "snup"
			}, jsx("b", null, "boldy"));
			let e = {
				kind: HKind.Element,
				tag: "div",
				p: {
					class: "red",
					title: "snup"
				},
				cn: [{
					kind: HKind.Element,
					tag: "b",
					cn: ["boldy"]
				}]
			};
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.it)("HFragment empty", () => {
			let h = jsx(jsxf, null);
			let e = { kind: HKind.Fragment };
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.it)("HFragment with children", () => {
			let h = jsx(jsxf, null, jsx("b", null, "boldy"));
			let e = {
				kind: HKind.Fragment,
				cn: [{
					kind: HKind.Element,
					tag: "b",
					cn: ["boldy"]
				}]
			};
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.it)("HFragment nested", () => {
			let h = jsx(jsxf, null, jsx(jsxf, null));
			let e = {
				kind: HKind.Fragment,
				cn: [{ kind: HKind.Fragment }]
			};
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.test)("HClassComponent ", () => {
			class C {}
			let h = jsx(C, null);
			let e = {
				kind: HKind.ClassComponent,
				tag: C
			};
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.test)("HClassComponent with props and children", () => {
			class C {}
			let h = jsx(C, { class: "red" }, "hops");
			let e = {
				kind: HKind.ClassComponent,
				tag: C,
				p: { class: "red" },
				cn: ["hops"]
			};
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.test)("HFunctionComponent ", () => {
			function F() {}
			let h = jsx(F, null);
			let e = {
				kind: HKind.FunctionComponent,
				tag: F
			};
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.test)("HFunctionComponent with props and children", () => {
			function F() {}
			let h = jsx(F, { class: "red" }, jsx("i", null, "italy"));
			let e = {
				kind: HKind.FunctionComponent,
				tag: F,
				p: { class: "red" },
				cn: [{
					kind: HKind.Element,
					tag: "i",
					cn: ["italy"]
				}]
			};
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.test)("jsx 1", () => {
			let F = ({ a }) => jsx(jsxf, null, a.map((x) => jsx("div", null, x)));
			let h = jsx("body", null, jsx(F, { a: [
				1,
				2,
				3
			] }));
			let e = {
				kind: HKind.Element,
				tag: "body",
				cn: [{
					kind: HKind.FunctionComponent,
					tag: F,
					p: { a: [
						1,
						2,
						3
					] }
				}]
			};
			(0, vitest.expect)(h).toEqual(e);
		});
		(0, vitest.test)("adhoc 1", () => {
			let h = jsx("body", null, jsx(jsx(jsxf, null, jsx("b", null, "1"), jsx("b", null, "2")), null));
			jsx("body", null, jsx(jsx(jsxf, null, jsx("b", null, "1"), jsx("b", null, "2")), null));
			(0, vitest.expect)(h).toEqual({
				kind: 1,
				tag: "body",
				cn: [{
					kind: 1,
					tag: {
						kind: 4,
						cn: [{
							kind: 1,
							tag: "b",
							cn: ["1"]
						}, {
							kind: 1,
							tag: "b",
							cn: ["2"]
						}]
					}
				}]
			});
		});
		(0, vitest.test)("adhoc 2", () => {
			let h = jsx("body", null, jsx(jsx(jsxf, null, jsx(jsx(jsxf, null, "hasen"), null)), null), "hopp");
			jsx("body", null, jsx(jsx(jsxf, null, jsx(jsx(jsxf, null, "hasen"), null)), null), "hopp");
			jsx("body", null, jsx(jsx(jsxf, null, jsx(jsx(jsxf, null, "hasen"), null)), null), "hopp");
			(0, vitest.expect)(h).toEqual({
				kind: 1,
				tag: "body",
				cn: [{
					kind: 1,
					tag: {
						kind: 4,
						cn: [{
							kind: 1,
							tag: {
								kind: 4,
								cn: ["hasen"]
							}
						}]
					}
				}, "hopp"]
			});
		});
		vitest.test.skip("adhoc 1 with funs, does not work for testing that simple", () => {
			console.log("!!!!!!!!!!");
			let F = () => jsx(jsxf, null, jsx("b", null, "1"));
			let h = () => jsx("body", null, jsx(F, null));
			let f_is = () => jsx(jsxf, null, jsx("b", null, "1"));
			let h_is = () => jsx("body", null, jsx(F, null));
			console.dir(f_is);
			console.dir(h_is);
			(0, vitest.expect)(h.toString()).toEqual({
				kind: 1,
				tag: "body",
				cn: [{
					kind: 1,
					tag: {
						kind: 4,
						cn: [{
							kind: 1,
							tag: "b",
							cn: ["1"]
						}]
					}
				}]
			}.toString());
		});
	});
	//#endregion
});
