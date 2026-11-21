# Inventory of components found so far (input for jmc intrinsic components)

Source: find in files for `extends Component` in `*.tsx`, 17 hits in `D:\dev\vrvis\2026`.
More sources (other file types, other search patterns) will be added before the jmc work starts.

## 1. Result overview

Of the 17 hits only **2 distinct generic components** exist: `SelectBox` and `ComboBox`.
Each exists twice, as identical copies (differences are only line endings):

| Component | Copy A | Copy B |
|---|---|---|
| SelectBox | `otta\otta-app\src\components\selectbox.tsx` | `zeitweg\otta_app\src\components\selectbox.tsx` |
| ComboBox (+ css) | `otta\otta-app\src\components\combobox.tsx` | `zeitweg\otta_app\src\components\combobox.tsx` |
| gallery (demo) | `otta\otta-app\src\components\gallery.tsx` | `zeitweg\otta_app\src\components\gallery.tsx` |

Only `SelectBox` is used by an app so far: `otta\otta-app\src\assistant\datafilter.tsx` (4 uses). `ComboBox` is only shown in `gallery.tsx`.

The other 11 hits are domain specific (not generic), listed in section 4.

## 2. SelectBox

Wraps a native `<select>`. Items are any values, shown and valued via `toString()`.

**Props**

| Prop | Type | Meaning |
|---|---|---|
| `items` | `any[]` | the options |
| `value?` | `string` | currently selected item (compared with `==` against items) |
| `onvalue?` | `(x: any) => void` | called with the raw `input` event (callers do `ev.target.value`) |
| `disabled?` | `boolean` | disables the select |

**Implementation** (`selectbox.tsx`)

```tsx
import { Component } from '@snupo/jmc'

type Props = {
    items: any[],
    onvalue?: (x: any) => void
    value?: string
    disabled?: boolean
}

export class SelectBox extends Component<Props> {

    view() {
        return <select oninput={x => this.props.onvalue?.(x)} value={this.value}>
            {this.props.items.map(i => <option value={i.toString()}>{i.toString()}</option>)}
        </select>
    }

    mounted(): void {
        this.setelement()
    }

    update() {
        requestAnimationFrame(this.setelement)
    }

    setelement() {
        let e = (this.element as HTMLSelectElement)
        e.value = this.value
        e.disabled = this.props.disabled === true
    }

    get value() {
        return this.props.items.find(i => i == this.props.value)
    }
}
```

**Usage** (`otta\otta-app\src\assistant\datafilter.tsx`)

```tsx
<SelectBox items={["*", ...m.categories]} onvalue={(ev: any) => c.selectcategory(ev.target.value)} value={m.selectedcategory} />
<SelectBox items={["*", ...m.trains]} onvalue={...} value={m.selectedtrainnumber} disabled={m.trains.isEmpty} />
```

**Observations for the jmc version**

- Value and `disabled` are set imperatively after render (`setelement`, deferred by `requestAnimationFrame` on update), because `<option>` children are rendered after the `value` attribute of `<select>`. A jmc intrinsic `select` should handle this itself (set value after children are patched).
- `setelement` is passed to `requestAnimationFrame` unbound; `this` is lost on updates (bug, works only if jmc binds methods).
- `value` getter returns the *item* (not its string) that equals `props.value`, then assigns it to `e.value` (coerced to string). If nothing matches it is `undefined`, so the select shows "undefined"/blank.
- `onvalue` hands out the raw event, not the value, and is named like a value callback. A cleaner interface: `onvalue(value)`.
- Items are only strings in the DOM; selecting returns a string, not the original item object. No separation of label and value.
- No placeholder/empty option, no `id`/`class`/`title` pass through.

## 3. ComboBox

Text input with suggestions: `<input>` + `<datalist>` (native, no custom dropdown).

**Props**

| Prop | Type | Meaning |
|---|---|---|
| `items` | `any[]` | suggestions |
| `placeholder?` | `string` | input placeholder |

**Implementation** (`combobox.tsx`)

```tsx
import { Component } from "@snupo/jmc"
import "./combobox.css"

let datalistcounter = 50

type Props = {
    items: any[]
    placeholder?: string
}

export class ComboBox extends Component<Props> {

    datalistid: string

    constructor(props: Props) {
        super(props)
        this.datalistid = `dl${datalistcounter++}`
    }

    mounted(): void {
        this.element.querySelector("input")?.setAttribute("list", this.datalistid)
    }

    view() {
        return <combobox>
            <input placeholder={this.props.placeholder} />
            <datalist id={this.datalistid}>{this.props.items.map(i => <option value={i}></option>)}</datalist>
        </combobox>
    }
}
```

**Stylesheet** (`combobox.css`): completely commented out. It was an attempt to make the native dropdown arrow
(`::-webkit-calendar-picker-indicator`) always visible (Chrome/Edge/Safari) and to set `appearance: auto` for Firefox.
Effectively there is no styling right now.

**Demo** (`gallery.tsx`)

```tsx
import { patch } from "@snupo/jmc"
import { ComboBox } from "./combobox"

patch(document.body, <ComboBox items={["hase", "ente", "fuchs", "flapp"]} />)
```

**Observations for the jmc version**

- Unique datalist id from a module counter (starts at 50), set via `setAttribute("list", ...)` in `mounted` (the `list` attribute on input is read-only as a property, which is why it is not in JSX).
- No `value` / `onvalue` / `oninput` props: the component is currently not usable to read or set the entered text. Must be added.
- Not updated when `items` change in a way that matters? The datalist is re-rendered by `view()`, so it follows; the `list` attribute is set once and stays valid.
- Custom element tag `<combobox>` as wrapper (light DOM), consistent with the "no Shadow DOM" rule.
- The `gallery.tsx` pattern (patch a component into `document.body`) is a useful seed for a jmc component gallery/demo page.

## 4. Other `extends Component` hits (domain specific, not generic)

Found but not generic widgets; listed so nothing is lost. Some are duplicates across `_alt`, `otta`, `zeitweg`, `sim-components` (older copies vs. current).

| Class | Files |
|---|---|
| ZeitWegDiagram | `otta\zeitweg-component\src\view\zeitwegdiagram.tsx`, `zeitweg\zeitweg-component\src\view\zeitwegdiagram.tsx` |
| Trains | `otta\zeitweg-component\src\view\trains.tsx`, `zeitweg\zeitweg-component\src\view\trains.tsx` |
| TimeAxis | `otta\zeitweg-component\src\view\timeaxis.tsx`, `zeitweg\zeitweg-component\src\view\timeaxis.tsx` |
| DistanceAxis | `otta\zeitweg-component\src\view\distanceaxis.tsx`, `zeitweg\zeitweg-component\src\view\distanceaxis.tsx` |
| DetourMap | `_alt\detour-map\detour-map\src\view\map.tsx`, `sim-components\detour-map\src\view\map.tsx` |
| DetourDiagram | `sim-components\detour-diagram\src\component\view\detour-diagram.tsx`, `_alt\detour-map\detour-diagram\src\view\detour-diagram.tsx`, `_alt\detour-diagram\src\view\detour-diagram.tsx` |

Read in detail: `TimeAxis` and `DistanceAxis` only (the others were not opened).

- **TimeAxis**: SVG axis with gridlines/ticks/labels (every 10th minute labelled, every 5th a long tick). Reads `vm`. Formats time as `hh:mm` in Europe/Vienna with `Temporal`. A generic "axis" component (scale in, ticks/labels out) could be derived, but it is tied to `vm.timerange`, `vm.yscaler`, `vm.xrange`.
- **DistanceAxis**: axis with labels positioned by x, hover highlighting of the nearest label (`onmousemove` / `onmouseleave` -> controller), and automatic **label row assignment** against overlap (`assignLabelRows` from `src\view\layout.ts`, writes CSS var `--rowcount`). The collision-avoiding label layout is a candidate for a generic helper.
- Both use the jmc lifecycle hooks `mounted` and `update` also as attributes on plain elements (`<labels update={...} mounted={...}>`), and `cc({...})` for conditional classes.

## 5. Gaps / still to search

- Components defined as plain function components (`const X = () => <...>`), not found by `extends Component`. Example seen: `DataFilterView`, `HiddenLabels`, `Ticks`.
- Other base classes (e.g. the `WebComponent` draft in `sim-components\detour-diagram\src\jmc\`).
- Other generic widgets possibly hidden in apps: buttons, tabs, dialogs, tables, tooltips, sliders, checkboxes, date pickers.
- `.ts`/`.jsx`/`.html` files and other file extensions.


---

# Source 2: omma Mold

Path: `D:\dev\soundsolutions\omma_source\frontend\apps\webapp\components\Mold` (89 files, mostly data/doc).
This app already has a small jmc parts library in `jmc-parts/` (`NumberStepper`, `RangeSlider`, `base.ts`) and several generic widgets hidden inside domain views (tri-state toggle, icon helper, segmented list, color checkbox group).
`extends Component` hits here: `NumberStepper`, `RangeSlider` (both generic), `Chart`, `Overview`, `CursorCircle` (domain, d3/svg). Everything else is function components.
The neighbour folder `..\ui` is a shadcn-vue set (accordion, button, checkbox, dialog, select, slider, tabs, tooltip, number-field, about 50 entries). It was not searched, but it is a ready checklist of what a basic set contains.

## 5b. File times and which copy is newer

| Item | Time | Verdict |
|---|---|---|
| otta `selectbox.tsx`, `combobox.tsx`, `gallery.tsx` | 2026-10-31 | identical content to zeitweg |
| zeitweg `selectbox.tsx`, `combobox.tsx`, `combobox.css`, `gallery.tsx` | 2026-11-05 08:29 (all four the same second, so a copy/move) | newer by time, **but identical code** (only line endings differ), so neither is more advanced |
| otta `combobox.css` | 2026-09-17 | oldest, same content |
| Mold `numberstepper.tsx` | 2026-10-26 | newest of the parts, the stepper is the most developed component found (clamping rules, keyboard, comma input) |
| Mold `slider.tsx/css`, `numberstepper.css`, `icons.tsx`, `rectxy.tsx`, `selector.tsx` | 2026-10-18 14:47:20 (all the same instant, so a checkout/copy time, no information) | judged by code only |
| Mold `base.ts` | 2026-11-17 | newest file, recently touched (logging helper) |
| Mold `fitpanel.tsx`, `fitparamsform.tsx`, `fitpanel.css` | 2026-11-08 | actively developed, the tri-state toggle is recent |

Conclusion: SelectBox/ComboBox exist in one version only. For the other duplicates (zeitweg/otta/detour/_alt) the domain copies were not compared in detail.

## 6. Generic parts in `jmc-parts/`

### 6.1 `base.ts` (shared helpers)

```ts
export type Expr<T> = T | (() => T)
export let evaluate = <T>(expr: Expr<T>): T => (expr instanceof Function ? expr() : expr)
```

`Expr<T>`: a prop may be a value or a getter. With a getter the component reads the current model state itself on each render (solves stale props passed once to `patch`, see CLAUDE.md).
The file also has `loggedmethodscoloredexcept(bgcolor, o, exclude)` (debug logging of controller methods, wraps jmc's `loggedmethodsex`; not a widget, but a jmc helper candidate):

```ts
import { loggedmethodsex } from '@snupo/jmc'

/** names of the public methods of T */
export type MethodNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T] & string

/** like jmc's loggedmethodscolored, but calls to the methods in exclude are not logged */
export const loggedmethodscoloredexcept = <T extends Record<string, any>>(bgcolor: string, o: T, exclude: readonly MethodNames<T>[]): T => {
    const skip = new Set<string>(exclude)
    return loggedmethodsex(o, (name, args, result) => {
        if (!skip.has(name)) console.log('%c' + name, `background:${bgcolor};color:white;padding:2px;font-weight:bold`, args, result)
    })
}
```

### 6.2 `NumberStepper` (`numberstepper/numberstepper.tsx` + `.css`)

Number input with `-` and `+` buttons. Props: `value: Expr<number>`, `setvalue(x)`, `min?`, `max?`, `step?`, `decimals?`, `class?` (declared, not used).
Behavior worth keeping:
- min/max clamp only the buttons, and only while the value is inside the range. Typed text may leave the range, from there the buttons step freely.
- `change` (blur/enter) parses text, accepts `,` as decimal separator, rejects invalid text (reverts to current value), rounds to `decimals`.
- Keyboard: Enter commits (blur), Escape reverts, `+`/ArrowUp and `-`/ArrowDown commit pending text then step. Other single chars except digits, `.` and `,` are blocked; ctrl/meta shortcuts pass.
- Sets `i.value = this.text` after change, because jmc only writes value when it changed.
- Buttons use `onmousedown`, no auto repeat.
- Oddities: `step` has no default (`this.props.step!`), so omitting it gives NaN. `decimals` undefined gives `toFixed(undefined)` = 0 decimals in `text`, but `round` defaults to 2. Both differ.

```tsx
import { cc, type H, Component, jsx } from "@snupo/jmc"
import { evaluate, type Expr } from "../base"
import './numberstepper.css'

type Props = {
    value: Expr<number>
    setvalue: (x: number) => void
    min?: number
    max?: number
    step?: number
    decimals?: number
    class?: string
}

const round = (v: number, decimals = 2) => {
    const factor = 10 ** decimals;
    return Math.round((v + Number.EPSILON) * factor) / factor;
}

export class NumberStepper extends Component<Props> {

    view(): H {
        return <div class='jmc-stepper'>
            <button type='button' onmousedown={this.onDecrement}>&minus;</button>
            <input type='text' value={this.text} onchange={this.onChange} onkeydown={this.onKeydown} />
            <button type='button' onmousedown={this.onIncrement}>&#43;</button>
        </div>
    }

    get value() { return evaluate(this.props.value) }
    get text()  { return this.value.toFixed(this.props.decimals) }

    // min/max bound the buttons only while the value is inside them. typed text may leave the range,
    // and from there the buttons step freely
    increment(incrementValue: number) {
        let { min = -Infinity, max = Infinity, decimals } = this.props
        let v = round(this.value + incrementValue, decimals)
        if (this.value >= min && this.value <= max) v = Math.min(max, Math.max(min, v))
        this.props.setvalue(v)
    }

    // fires on blur and enter. invalid text reverts to the current value, valid text is taken unclamped
    onChange(ev: Event) {
        let i = ev.target as HTMLInputElement
        let v = Number(i.value.trim().replace(',', '.'))
        if (i.value.trim() && Number.isFinite(v)) this.props.setvalue(round(v, this.props.decimals))
        i.value = this.text // jmc only sets value when it changes, so a rejected or rounded input would stay otherwise
    }

    onKeydown(ev: KeyboardEvent) {
        let i = ev.target as HTMLInputElement
        switch (ev.key) {
            case 'Enter': ev.preventDefault(); i.blur(); break // blur fires change; preventDefault keeps the form from submitting
            case 'Escape': i.value = this.text; i.blur(); break
            // steps commit pending text first, so they count from what was typed
            case '+':
            case 'ArrowUp': ev.preventDefault(); this.onChange(ev); this.onIncrement(); i.value = this.text; break
            case '-':
            case 'ArrowDown': ev.preventDefault(); this.onChange(ev); this.onDecrement(); i.value = this.text; break
            // digits and decimal separators only. other single chars are dropped, shortcuts (ctrl/meta) and named keys pass
            default: if (ev.key.length == 1 && !ev.ctrlKey && !ev.metaKey && !/[\d.,]/.test(ev.key)) ev.preventDefault()
        }
    }

    onIncrement() { this.increment(this.props.step!) }
    onDecrement() { this.increment(-this.props.step!) }
}
```

`numberstepper.css` (CSS nesting, fixed 80px width, hard-coded colors, no theming variables):

```css
.jmc-stepper {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    width: 80px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    font-family: sans-serif;
    overflow: hidden;

    button {
        background: #eee;
        border: none;
        font-size: 16px;
        font-weight: 400;
        color: #000000;
        cursor: pointer;
        padding: 0 4px;
        user-select: none;
        &:hover { opacity: 0.6; }
        overflow: hidden;
    }

    input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        text-align: center;
        font: inherit;
        font-size: 15px;
        font-weight: 500;
        padding: 0;
        &:focus { background: #f0f7ff; }
    }
}
```

### 6.3 `RangeSlider` (`slider/slider.tsx` + `.css`)

Styled native `<input type=range>`. Props: `value: Expr<number>`, `setvalue(x)`, `min?`, `max?`, `step?`. Uses `oninput` (live), reads the value from `this.element`. Unused import `cc`.
Slider and stepper share one props interface, so `<RangeSlider {...props} /><NumberStepper {...props} />` works (a `SliderRow` in `fitparamsform.tsx`, the only place both are used).

```tsx
import { cc, type H, Component, jsx } from "@snupo/jmc"
import { evaluate, type Expr } from "../base"
import "./slider.css"

type Props = {
    value: Expr<number>
    setvalue: (x: number) => void
    min?: number;
    max?: number;
    step?: number;
}

export class RangeSlider extends Component<Props> {

    view(): H {
        let { min, max, step } = this.props
        return <input
            type="range"
            class='jmc-range-slider'
            min= {min}
            max= {max}
            step={step}
            value={evaluate(this.props?.value)}
            oninput={this.oninput}
        />
    }

    oninput() {
        let v = parseFloat((this.element as HTMLInputElement).value)
        this.props.setvalue?.(v)
    }
}
```

```css
.jmc-range-slider {
    -webkit-appearance: none;
    appearance: none;
    max-width: 80px;
    background: transparent;
    cursor: pointer;

    /* chrome */
    &::-webkit-slider-runnable-track {
        width: 100%;
        height: 7px;
        background-color: #555;
        border-radius: 4px;
    }

    /* mozilla */
    &::-moz-range-track {
        width: 100%;
        height: 8px;
        background-color: #1c1c1c;
        border-radius: 6px;
    }

    /* chrome */
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #ffffff;
        border: 3px solid #1c1c1c;
        margin-top: -6px; /* Centers thumb over 12px track */
        box-sizing: border-box;
    }

    /* mozilla */
    &::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #ffffff;
        border: 3px solid #1c1c1c;
        box-sizing: border-box;
    }

    &:focus { outline: none; }
}
```

Observations: track height differs between Chrome (7px) and Firefox (8px), the comment mentions a "12px track" (stale). Colors are hard-coded.

## 7. Generic widgets found inside views

### 7.1 Tri-state toggle (`SpreadGroupToggle`, `view/main/chart/fitpanel.tsx`, state logic in `fitcontroller.ts`)

A round button for "check/uncheck a group of things". States `'on' | 'off' | 'mixed' | 'none'` (`none` = nothing checkable, button disabled). Click: `on` turns all off, `off` and `mixed` turn all on.
The state is computed from the group (`spreadstate`), the class name carries it (`cc('spread-group', state)`), so the look is pure CSS. This is the "triple checkbox" from `doc/clog.txt`.

```tsx
let SpreadGroupToggle = ({ steps, title }: { steps: StepModel[], title: string }) => {
    let state = fc.spreadstate(steps)
    return (
        <button
            type='button'
            class={cc('spread-group', state)}
            disabled={state == 'none'}
            title={title}
            onclick={() => fc.togglespreadgroup(steps)} />
    )
}
```

```ts
// fitcontroller.ts
spreadstate(ss: S[]): 'on' | 'off' | 'mixed' | 'none' {
    let cs = this.checkable(ss)
    let n = cs.filter(s => vm.spreadtargets.has(s)).length
    return cs.length == 0 ? 'none' : n == 0 ? 'off' : n == cs.length ? 'on' : 'mixed'
}
// all on turns them off, otherwise (off or mixed) all are turned on
togglespreadgroup(ss: S[]) { this.setspreadtargets(ss, this.spreadstate(ss) != 'on') }
```

CSS (`fitpanel.css`, excerpt; one round 16px control shared by checkbox, toggle and button, color via `--c`; the `mixed` style is further down in that file and was not read):

```css
.spread-group, .spread-check, .spread-button {
    --c: var(--step-color);
    appearance: none;
    display: flex; align-items: center; justify-content: center;
    flex: none; /* a squeezed box turns the 50% radius into an ellipse */
    margin: 0 0 0 auto; padding: 0;
    width: 16px; height: 16px;
    border: 1.5px solid var(--c);
    border-radius: 50%;
    background: white; color: var(--c);
    cursor: pointer;
    &.on, &:checked, &.linked { background: var(--c); color: white; }
}
```

Related small pieces in `fitparamsform.tsx`:
- `SpreadCheckbox`: round-styled `<input type=checkbox>` that stops `mousedown` propagation so the parent row is not selected.
- `SpreadNameToggle`: same toggle for one named group (hover line joining siblings is domain CSS).
- `hover(s)`: returns `onmouseover`/`onmouseleave` props and ignores hover over the row's own controls.
- Spread button with a `linked` on/off state (a toggle button).

### 7.2 Segmented list / button group (`ProjectionSelector`, `view/main/chart/chart.tsx`)

A radio-like list of options, the current one has class `selected`. Items are plain `<li>` with a click handler (not keyboard accessible).

```tsx
const projections: ProjectionName[] = ['d', 'raw', 'x', 'y']

const ProjectionSelector = () => (
    <div class='axis-label axis-label-proj'>
        <ul id='projectionselector'>
            {projections.map(p => (
                <li onclick={() => c.selectprojection(p)} class={cc({ selected: p == vm.projection })}>
                    {p}
                </li>
            ))}
        </ul>
    </div>
)
```

The same pattern: `torus-buttons` in `fitparamsform.tsx` (icon buttons, classes `selected` and `detected`) and the `colorgroups` header in `info.tsx` (numbered chips, class `empty`, click clears the group).
Candidate: `ToggleGroup` / `SegmentedControl` with `value`, `items`, `setvalue`, optional per-item content (text or icon).

### 7.3 Color checkbox group (`ColorGroups`, `view/main/info/info.tsx`)

A row of native checkboxes, one per color group, tinted with `accent-color`, exactly one checked (radio behavior built from checkboxes), title per item.

```tsx
let ColorGroups = ({ p }: { p: P }) => <div class="colorgroups">
    {vm.colorgroups.map(i =>
        <input
            type="checkbox"
            checked={p.colorgroup == i}
            onclick={() => c.setpartcolorgroup(p, i)}
            style={`accent-color:${colors.forpartgroup(i)}`}
            title={`Color group ${i}`} />
    )}
</div>
```

Candidate: a `RadioGroup` with a per-item color. Same file: `splitexpando` (splits "caption:value") and a native `<details><summary>...</summary>` disclosure, which has no component yet.

### 7.4 Icon helper (`view/main/chart/icons.tsx`, `view/selector/icons.tsx`)

`create(IconNode)` turns a `lucide` icon node into a JSX `<svg>` (18px, `currentColor`, round stroke). Exports `Dot, ArrowUpDown, ArrowLeftRight, Move, Link2`, a hand-made `Spread` (double arrow, 11px) and, in `selector/icons.tsx`, a hand-copied lucide `Eye` (14px). The duplicated SVG boilerplate shows the need for an `Icon` component taking a lucide node, size and stroke width.

```tsx
import { jsx } from "@snupo/jmc"
import * as icons from "lucide"
import { type IconNode } from "lucide"

let size = 18

export let create = (i: IconNode) => <svg xmlns="http://www.w3.org/2000/svg"
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
>
    { i.map(([tag, attrs]) => jsx(tag, attrs)) }
</svg>

export let Dot = create(icons.Dot)
export let Move = create(icons.Move)
```

Domain only in the same file: `TorusTypeIcon` (8 wave paths for the torus types `1+` to `4-`).

### 7.5 `RectXY` (`view/overview/rectxy.tsx`)

SVG `<rect>` from two corner points (any order), enlarged to a minimum size of 40 so tiny rects stay visible. It has a private `cc2`, a copy of jmc's `cc`. Geometry helper, not a basic widget.

```tsx
const minsize = 40
const minsizehalf = minsize / 2

function adaptedsize(min: number, max: number) {
    if (min > max) [min, max] = [max, min]
    let size = Math.abs(max - min)
    if (size < minsize) {
        let mid = min + Math.abs(max - min) / 2
        min = mid - minsizehalf
        max = mid + minsizehalf
        size = minsize
    }
    return { min, size: Math.abs(max - min) }
}

export let RectXY = ({ x1, x2, y1, y2, rx, className }: { x1: number, x2: number, y1: number, y2: number, rx?: number, className?: string }) => {
    let xset = adaptedsize(x1, x2)
    let yset = adaptedsize(y1, y2)
    return <rect {...{ x: xset.min, y: yset.min, width: xset.size, height: yset.size, rx }} class={cc2(className)} />
}
```

### 7.6 Conditional `When` (jmc, used in `fitparamsform.tsx`)

`<When cond={step.fittingerror}><span class='fittingerror'>error</span></When>`. Already in jmc, listed for completeness.

### 7.7 Data display patterns (`humppanel.tsx`)

`dl.summary` (label/value pairs) and a small numbered table with `thead/tbody`, `toFixed(4)` formatting. Domain use only so far (`KeyValueList`, `Table` candidates, low priority).

### 7.8 Selector grid (`view/selector/selector.tsx`, 106 lines)

A focusable `<table id="selector" tabindex={0} onkeydown=...>` of cells with keyboard navigation and eye icons for visibility. Not read in detail.

## 8. Domain components in Mold (not generic)

| Item | File | Note |
|---|---|---|
| `Chart` (class) | `view/main/chart/chart.tsx`, 620 lines | d3 zoom/brush chart, `ResizeObserver`, scalers. A zoomable chart could become generic later. |
| `Overview`, `CursorCircle` (class) | `view/overview/overview.tsx` | svg overview of mold parts. `CursorCircle` comment: jmc calls `update()` only on reuse, so `mounted()` calls `update()` as well. |
| `FitPanel`, `FitParamsForm`, `HumpPanel` | `view/main/chart/` | domain panels |
| `Calc`, `Data`, `Info` | `view/main/*` | entry functions that `patch` a function component into a node and call `mount({ updateview, patch })` (the vue bridge) |

## 9. Cross-cutting findings for the jmc design (from both sources)

1. **Prop naming differs**: `value` + `onvalue(event)` (SelectBox) against `value` + `setvalue(value)` (NumberStepper, RangeSlider). Pick one, hand out values, not events. Mold's `setvalue` is the better one.
2. **`Expr<T>`** (value or getter) exists in Mold's `base.ts`, SelectBox takes plain values. One answer for stale props is needed.
3. **Lifecycle asymmetry**: SelectBox and CursorCircle both run the same code in `mounted()` and `update()`. SelectBox also needs `requestAnimationFrame` to set `value` after the options exist. An intrinsic `select` should do all of this itself.
4. **Controlled inputs**: NumberStepper sets `i.value = this.text` by hand because jmc only writes changed values. jmc needs a rule: re-apply the model value after an event if the DOM differs.
5. **Native elements are wrapped, not replaced**: `select`, `datalist`, `input range`, `input checkbox`, `details`. Components add behavior and CSS.
6. **Styling**: Mold parts use hard-coded colors, fixed widths and `.jmc-` class prefixes (`jmc-stepper`, `jmc-range-slider`). The prefix is a good rule for light DOM components. CSS variables (`--c`, `--step-color` are already used) are the next step. SelectBox/ComboBox have no CSS.
7. **Missing but needed by the use**: tri-state checkbox, round toggle button, segmented/toggle group, radio group, icon wrapper, collapsible, tabs.
8. **Duplicated utility**: `cc2` (RectXY) duplicates jmc's `cc`.
9. **Do not copy**: NumberStepper `step`/`decimals` defaults, unused `class` prop, stale slider CSS comment, unused `cc` import in the slider.

## 10. Still to search (updated)

- `D:\dev\soundsolutions\omma_source\frontend\apps\webapp\components\ui` (shadcn-vue, about 50 widgets, a reference list, not our code)
- the other omma components (`Analyse`, `Collect`, `HeadPanel`, `Login`, `SidePanel`, `TimeSeries`, `UserManagement`)
- `.spread-group.mixed` CSS in `fitpanel.css` and `view/selector/selector.tsx` in detail
- `sim-components\detour-diagram\src\jmc\` (`WebComponent` draft) and the items of section 5
- compare the domain duplicates (`_alt`, `otta`, `zeitweg`, `sim-components`) by file time and code


---

# Source 3: interspot

Path: `D:\dev\interspot\2026\web\src` (12 tsx files, 1522 lines in view, app, pages and base files).
Result: **no class components at all** (no `extends Component`), only function components, and the apps are domain specific (TV event planning: events, week, Sendezeiten, reds, notes, production).
The tsx files contain **no generic widget** that is ready to lift. But three generic things were found in `base/` and in the views, and the app shows what jmc needs for light DOM custom elements and DOM-behavior helpers.

## 11. Generic things found

### 11.1 `DropZone` (`base/dropzone.ts`, 57 lines, 2026-10-25) - the best find

A framework-free drag and drop helper, not a component: an object an element's `dragover/dragleave/drop` handlers are attached to. It finds the accepted target below the pointer, marks it, sets the drop effect and calls back on drop. Used twice (`eventscontroller.uploads` for file drops on events, `eventswochecontroller.sendezeiten` for moving events between sende cells). Fits jmc well: stateless config, the controller owns it, the view only attaches the three handlers. Candidate for a jmc `dropzone` attribute or helper.

```ts
import { rebind } from "@snupo/jmc"

// what a drop zone does: its targets, what they take and what a drop does
export interface DropZoneConfig {
    // the target at the element under the pointer, null if there is none
    target(el: Element): HTMLElement | null
    // whether t takes what is dragged
    accepts(dt: DataTransfer, t: HTMLElement): boolean
    effect: "copy" | "move"
    // the accepted target under the pointer changed, undefined when there is none. the view marks it
    mark?(t: HTMLElement | undefined): void
    // while an accepted target is dragged over, e.g. to show where it lands
    over?(ev: DragEvent, t: HTMLElement): void
    drop(ev: DragEvent, t: HTMLElement): void
}

// an element that takes drops on targets below it. a view attaches dragover, dragleave and drop
export class DropZone {

    // the accepted target under the pointer
    target?: HTMLElement

    constructor(public config: DropZoneConfig) {
        rebind(this)
    }

    dragover(ev: DragEvent) {
        ev.preventDefault()
        const t = this.accepted(ev)
        this.mark(t)
        ev.dataTransfer!.dropEffect = t ? this.config.effect : "none"
        if (t) this.config.over?.(ev, t)
    }

    // only leaving the zone, not one of its elements, unmarks
    dragleave(ev: DragEvent) {
        if (!(ev.currentTarget as Node).contains(ev.relatedTarget as Node | null)) this.mark(undefined)
    }

    drop(ev: DragEvent) {
        ev.preventDefault()
        const t = this.accepted(ev)
        this.mark(undefined)
        if (t) this.config.drop(ev, t)
    }

    accepted(ev: DragEvent): HTMLElement | undefined {
        const t = this.config.target(ev.target as Element)
        return t && ev.dataTransfer && this.config.accepts(ev.dataTransfer, t) ? t : undefined
    }

    mark(t: HTMLElement | undefined) {
        if (t === this.target) return
        this.target = t
        this.config.mark?.(t)
    }
}
```

Usage (`eventscontroller.ts`):

```ts
uploads = new DropZone({
    target: el => el.closest<HTMLElement>("[folder]") ?? el.closest<HTMLElement>("event"),
    accepts: (dt, t) => dt.types.includes("Files") && (...),
    effect: "copy",
    mark: t => { /* sets m.filedrop, updates the view */ },
    drop: (ev, t) => this.fileuploads(t.closest<HTMLElement>("event")!, folderof(t), [...ev.dataTransfer!.files]),
})
```

Note: `mark` in this code writes the model from a drag callback (fine, it lives in the controller).

### 11.2 Textarea autogrow (`base/textarea.ts`, 17 lines, 2026-10-25)

Grows a textarea with its text, optionally focuses it. Used by the red note editor (`red.tsx`: `mounted={mountta}`, `rows={1}`). Candidate: `TextArea` with `autogrow` (and `autofocus`).

```ts
export function adjustta(ta: HTMLTextAreaElement) {
    if (ta.clientHeight) {
        ta.style.height = "auto" // so it shrinks too: scrollHeight is never below the current height
        ta.style.height = ta.scrollHeight + 'px'
    }
}

export function configureautogrow(ta: HTMLTextAreaElement) {
    if (ta.oninput) { return }
    ta.oninput = adjustta.bind(ta, ta)
    adjustta(ta)
}

export function configureautogrowandfocus(ta: HTMLTextAreaElement) {
    configureautogrow(ta)
    requestAnimationFrame(() => ta.focus())
}
```

Notes: it takes over `oninput` (a user handler would be overwritten or block it, `if (ta.oninput) return`). It needs the `requestAnimationFrame(...)` workaround from the view (`mountta`) to wait for layout, the same lifecycle pain as SelectBox. Programmatic changes of `value` do not re-adjust the height.

### 11.3 Year/month picker over text (`CurrentYearMonth`, `view/timebar.tsx`, with `routecontroller.ts`)

The text stays as it is, a transparent `<select>` sits over it, double click opens the native dropdown with `select.showPicker()`; focus returns to the surrounding span when it closes (`select.matches(":open")`), click toggles the "selected" (focus) state for arrow keys and mouse wheel stepping. Domain specific in the details (year/month/week), but the pattern (a text display with a hidden native picker, `showPicker`, `:open`) could be a jmc `Picker` / "inline select". Pieces: `toggleTimestep` (blur on second click), `openpicker`, `selectfocused`, `openfocusedpicker`, `wheel`.

```tsx
<span timestep="year" tabindex={0} onmousedown={rc.toggleTimestep} ondblclick={rc.openpicker}>
    <span id="year">{shown.year}</span>
    <select tabindex={-1} onfocus={rc.selectfocused} onchange={rc.yearSelected}>
        {selectableYears(shown.year).map(y => <option value={y} selected={y == shown.year}>{y}</option>)}
    </select>
</span>
```

```ts
openpicker(ev: MouseEvent) { (ev.currentTarget as HTMLElement).querySelector("select")!.showPicker() }
selectfocused(ev: FocusEvent) {
    const select = ev.currentTarget as HTMLSelectElement
    if (!select.matches(":open")) select.parentElement!.focus()
}
```

Plain `<option selected={...}>` is used here to set the value, instead of `value` on the select. This works without the `requestAnimationFrame` hack that SelectBox needs: **worth comparing** for the jmc intrinsic `select` (set `selected` on the option).

### 11.4 Small function components that are almost generic

- `Tab` (`view/toolbar.tsx`): a link with `sel` class when its page is the current one. With `onmousedown`, not click. A `Tabs`/`Tab` candidate (caption, selected, onselect).
- `Toolbar`: `nav` with `left`/`right` areas of tabs and info. Layout only.
- `Footer`: `<footer>{m.toast}</footer>`, shows the toasts of controllers. A `Toast` candidate (message text from the model, the controller clears it).
- `DayEntry` (`timebar.tsx`): a day chip with weekday and date, `sel` class, optional `long`. Domain.
- `WeekNav` with `<`, `>` and "heute" scroll links. Prev/next/today navigation, domain.
- The red note editor in `red.tsx` (`NoteCellView`): click-to-edit cell, text becomes textarea and back on blur (`onchange`, `onblur`, `mounted`). Pattern: **inline editable text** (`EditableText`) with autogrow, a candidate.

```tsx
const Tab = ({ caption, page }: { caption: string, page: Page }) => (
    <a class={cc({ sel: page == m.context.page })} onmousedown={() => rc.go({ page })}>{caption}</a>
)
```

### 11.5 Helpers in `base/common.ts`

All small functions, some jmc candidates:
- `debounced(f, ms)`, `range(start, end)` (both included), `flash(selector, time)` (fade animation via Web Animations), `collectQuasiFormData(f)` (values of `[name]` elements below f, a form without `<form>`), `stopPropagation(f)`, `getCookieValue(name)`, `logged(o, color, ...excludes)` and `loggedmethodsex(o, color)` (a Proxy version, **third variant** of method logging; the jmc one takes a callback, Mold's wrapper takes a color; see 6.1).
- `mergePrototype(mixin, ...targets)`: a class mixin helper.

### 11.6 Custom element tags + typing (`jsx-elements.d.ts`)

The app uses its own element names as light DOM wrappers (`event`, `timebar`, `overview`, `events`, `redname`, `notiz`, `assign`; ComboBox in otta uses `<combobox>`), and has to declare each in `jsx.JSX.IntrinsicElements` by hand. It also patches missing `onwheel` into `HTMLAttributesBase` ("jmc only declares onWheel, with the wrong type").

```ts
declare module '@snupo/jmc' {
    interface HTMLAttributesBase { onwheel?: (event: WheelEvent) => void }
    namespace jsx { namespace JSX { interface IntrinsicElements {
        event: HtmlHTMLAttributes
        timebar: HtmlHTMLAttributes
        /* ... */
    } } }
}
```

jmc points: (1) fix `onwheel` typing (probably `onWheel` in jmc is wrong); (2) a simple way to declare custom tags, or allow any lowercase custom tag type by default; (3) attributes like `timestep`, `day`, `folder`, `model` are used freely on elements here (`model={cm}` stores a model object on the DOM element and controllers read it from the element: `el.model`). Mold does similar with `data-`/ids.

### 11.7 Comment: pattern for components in the app

The app has a comment in `timebar.tsx`: "own component, so that the controller can update it alone (class properties only)". It means **jmc updates a part of the view only for components**, which is the reason class components are rare in this app and function components are used elsewhere. This is a useful requirement for jmc: partial updates of function components.

## 12. Result of the three sources together

| Source | Generic components | Other generic things |
|---|---|---|
| vrvis 2026 | `SelectBox`, `ComboBox` | `gallery.tsx` pattern |
| omma Mold | `NumberStepper`, `RangeSlider` | `Expr<T>`, tri-state toggle, segmented list, color radio group, `Icon` helper, `RectXY` |
| interspot | none | `DropZone`, textarea autogrow, picker-over-text, Tabs/Toast/EditableText patterns, helpers, `jsx-elements.d.ts` |

Possible jmc intrinsic basic set derived from this: `Select`, `ComboBox`, `NumberStepper`, `Slider`, `Checkbox` (incl. tri-state), `ToggleGroup`/`RadioGroup`, `Tabs`, `TextArea` (autogrow), `EditableText`, `Icon`, `Toast`, `DropZone`, plus the helpers `Expr`, `debounced`, `logged`.

## 13. Still to search (updated)

- `D:\dev\interspot\2026` other places: `css/` (component styling, `states.css`, `timebar.css`), `model/`, `net/`, and the non-`web` folders (only `web\src` tsx were read, `eventswoche.tsx`, `event.tsx`, `prod.tsx`, `vorschlag.tsx`, `suche.tsx`, `events.tsx` only skimmed by size and not read in detail)
- the items of sections 5 and 10
