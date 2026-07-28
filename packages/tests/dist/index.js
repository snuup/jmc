import { beforeEach, describe, it, expect } from "vitest";
import { Window } from "happy-dom";
function rebind(o, proto = Object.getPrototypeOf(o)) {
  Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([name, p]) => name != "constructor" && p.value instanceof Function).forEach(([name]) => o[name] = o[name].bind(o));
  return o;
}
let removeexcesschildren = (n, i) => {
  let c;
  while (c = n.childNodes[i]) {
    try {
      c.remove();
    } catch (_) {
    }
  }
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
  for (let p in oldprops)
    if (!(p in newprops))
      isproperty(e, p, oldprops[p]) ? e[p] = typeof oldprops[p] === "boolean" ? false : "" : e.removeAttribute(p);
  for (let p in newprops)
    isproperty(e, p, newprops[p]) ? e[p] = newprops[p] : e.setAttribute(p, newprops[p]);
};
function sync(uc, p, i, he, ns) {
  console.log("%csync", "background:orange", p.tagName, i, he, ns);
  if (he === null || he === void 0) return i;
  let c = p.childNodes[i];
  let h = evaluate(he);
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
        if (props?.update?.(c, uc)) return i + 1;
      }
      n.h = he;
      if (!uc.patchElementOnly && !iswebcomponent(h)) {
        const j = syncchildren(uc, n, h, 0, ns);
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
          if (isupdate && h.i.update(uc)) return i + 1;
          hr = h.i.view();
        } else {
          hr = h.tag(props, h.cn);
        }
        let j = sync(uc, p, i, hr, ns);
        let cn = p.childNodes[i];
        if (cn && !isfragmentfunction(h)) cn.h = he;
        if (isclasscomponent(h)) {
          h.i.element = cn;
          if (!isupdate) h.i?.mounted?.();
        }
        return j;
      case "object":
        return sync(uc, p, i, h.tag, ns);
      // fragments cause nested vnodes
      default:
        throw "1";
    }
  } else {
    let s = h;
    if (c?.nodeType == 3) {
      if (c.textContent != s) c.textContent = s;
    } else {
      c ? c.replaceWith(s) : p.append(s);
    }
    return i + 1;
  }
}
function syncchildren(uc, p, h, i, ns) {
  h.cn?.flat().forEach((hc) => i = sync(uc, p, i, hc, ns));
  return i;
}
function patch(e, h, uc = {}) {
  if (!e) return;
  delete uc.patchElementOnly;
  if (uc.replace) e.replaceChildren();
  const p = e.parentElement;
  const i = [].indexOf.call(p.childNodes, e);
  sync(uc, p, i, h);
}
function updateviewuc(u, ...sels) {
  {
    updateviewinternal(u, ...sels);
  }
}
function updateview(...sels) {
  {
    updateviewinternal({}, ...sels);
  }
}
function updateviewinternal(uc, ...sels) {
  if (!sels.length) sels.push("body");
  sels.flatMap((s) => typeof s == "string" ? [...document.querySelectorAll(s)] : s ? [s] : []).forEach((e) => {
    patch(e, e.h, uc);
  });
}
function jsx(tag, p, ...cn) {
  p ??= {};
  return { tag, p, cn };
}
function jsxf(props, ...cn) {
  console.log("jsxf", cn);
  return { cn };
}
class JMXComp {
  // assigned by jmx framework
  constructor(props) {
    this.props = props;
  }
  element;
  // overrides
  mounted() {
  }
  update(uc) {
  }
  // utility: updates the component's view
  updateview() {
    updateview(this.element);
  }
  get ismounted() {
    return this.element;
  }
}
beforeEach(() => {
  const window = new Window();
  globalThis.window = window;
  globalThis.document = window.document;
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
    expect(document.body.outerHTML).toBe('<body><div class="classo21">14</div></body>');
  });
  it("clear styles after update", () => {
    patch(document.body, jsx("body", null, jsx("div", { class: "hase" }, "div")));
    expect(document.body.innerHTML).toBe('<div class="hase">div</div>');
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
    let F = jsx(jsxf, null, jsx("b", null, "1"));
    let A = jsx("div", null, jsx(F, null), jsx("article", null), jsx("aside", null));
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
  it("Expression", () => {
    var h = () => jsx("body", null, "hase");
    patch(document.body, h);
    expect(document.body.outerHTML).toBe("<body>hase</body>");
  });
  it("Expression is updated", () => {
    let m = { name: "bugs" };
    var h = () => jsx("body", null, m.name);
    patch(document.body, h);
    expect(document.body.outerHTML).toBe("<body>bugs</body>");
    m.name = "bunny";
    updateview();
    expect(document.body.outerHTML).toBe("<body>bunny</body>");
  });
  it("patchelementonly does not expand the whole subtree", () => {
    let m = {
      sidepanel: false,
      longlist: [1, 2, 3]
    };
    let B = ({ x }) => {
      console.log("compute B");
      return jsx("b", null, x);
    };
    let Side = jsx("side", null, m.longlist.map((x) => jsx(B, { x })));
    let App = () => jsx("body", null, jsx(Side, null));
    patch(document.body, App);
    expect(document.body.outerHTML).toBe("<body><side><b>1</b><b>2</b><b>3</b></side></body>");
    console.log("updating");
    m.sidepanel = true;
    updateviewuc({ patchElementOnly: true }, "body");
  });
  it("patchelementonly does not expand the whole subtree 2", () => {
    let m = {
      sidepanel: false,
      longlist: [1, 2, 3]
    };
    let B = ({ x }) => {
      console.log("compute B");
      return jsx("b", null, x);
    };
    let Side = () => jsx("side", null, m.longlist.map((x) => jsx(B, { x })));
    let App = () => jsx("body", null, jsx(Side, null));
    console.log("patch initial");
    patch(document.body, App);
    expect(document.body.outerHTML).toBe("<body><side><b>1</b><b>2</b><b>3</b></side></body>");
    console.log("updating");
    m.sidepanel = true;
    updateviewuc({ patchElementOnly: true }, "body");
  });
  it("patchelementonly does not expand the whole subtree 3", () => {
    let B = ({ x }) => {
      console.log("compute B");
      return jsx("i", null, jsx("b", null, x));
    };
    let Side = jsx("side", null, jsx(B, { x: 1 }), jsx(B, { x: 2 }), jsx(B, { x: 4 }));
    let App = () => jsx("body", null, jsx(Side, null));
    patch(document.body, App);
    expect(document.body.outerHTML).toBe("<body><side><i><b>1</b></i><i><b>2</b></i><i><b>4</b></i></side></body>");
    console.log("updating");
    updateviewuc({ patchElementOnly: true }, "body");
    expect(document.body.outerHTML).toBe("<body><side><i><b>1</b></i><i><b>2</b></i><i><b>4</b></i></side></body>");
  });
});
