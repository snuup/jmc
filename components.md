# jmc components

A small set of ready-made input components for jmc apps. They are light DOM only (no Shadow DOM), wrap the native elements, and follow the architecture of the [design guide](design-guide.md): the value lives in the model, the component shows it, and a controller method changes it.

```tsx
import { NumberStepper } from '@snupo/jmc/comps'

<NumberStepper value={m.count} setvalue={c.setcount} min={0} max={10} />
```

```ts
// controller
setcount(x: number) { m.count = x; updateview() }
```

Each component imports its own stylesheet, so your bundler must handle CSS imports (Vite and webpack do). Import from `@snupo/jmc/comps`, or a single component from `@snupo/jmc/comps/numberstepper`.

## Rules for all components

- **`value` and `setvalue`.** The component shows `value` and calls `setvalue(newvalue)` when the user changes it. It hands out values (a string, a number, an item), never the DOM event. `setvalue` is a controller method, which changes the model and updates the view.
- **The model decides.** A component never keeps its own copy of the value. If the controller refuses a change, the component shows the old value again. `Checkbox` and `RadioGroup` re-apply the model value after a click, `NumberStepper` after a change.
- **Own state only for the UI.** `ComboBox` keeps whether its list is open, `NumberStepper` the text you are typing. Nothing else needs it.
- **`class` and `disabled`.** All input components take `class`. All of them can be disabled: `disabled` is a prop, or passed through to the native element.
- **Other attributes.** `TextArea`, `Select`, `ComboBox`, `DataListInput` and `Checkbox` pass every other standard attribute (`id`, `title`, `name`, `placeholder`, ...) on to the native element. `Checkbox` sends `class` and `style` to its label. The other components take only the props listed below.
- **Items.** `Select`, `ToggleGroup`, `RadioGroup` and `Tabs` work on any items, not only strings. They hand out the item itself. `label(item)` sets what is shown, the default is `String(item)`.
- **Timing.** `Select` and `TextArea` finish their work (the selected option, the height) in a microtask after the render. Code that reads the DOM synchronously after `updateview()` may see the state before that.

### Styling

Class names start with `jmc-` and all rules are in the CSS layer `jmc`, so any CSS of your app wins without specificity fights. Colors and sizes are CSS variables with defaults. Set them on `:root`, or on one element to change only the components below it:

| variable | meaning |
|---|---|
| `--jmc-color` | text color |
| `--jmc-bg` | background of inputs |
| `--jmc-border` | border color |
| `--jmc-radius` | corner radius |
| `--jmc-padding` | padding of inputs and buttons |
| `--jmc-accent` | focus and selection color |
| `--jmc-bg-focus` | hover and focus background |
| `--jmc-bg-button` | button background of `NumberStepper` |
| `--jmc-stepper-width` | width of `NumberStepper` |
| `--jmc-slider-width`, `--jmc-track-height`, `--jmc-track`, `--jmc-thumb`, `--jmc-thumb-size` | `RangeSlider` |
| `--jmc-checkbox-radius` | corner radius of `Checkbox` |

---

## TextArea

A textarea that grows and shrinks with its text. Use it where a text can have several lines and you don't want a scrollbar.

| prop | type | |
|---|---|---|
| `value` | `string` | |
| `setvalue?` | `(value: string) => void` | called on every input |
| other | textarea attributes | `placeholder`, `disabled`, `rows` (default 1), ... |

```tsx
<TextArea value={m.note} setvalue={c.setnote} placeholder='a note' />
```

- The height follows the text when the user types, when the model changes the value, and when the width changes (the text wraps anew).
- A hidden textarea is adjusted once it is shown.
- `autofocus` focuses it when it is mounted.
- Browsers that support `field-sizing: content` can do this in CSS alone.

## NumberStepper

A number input with minus and plus buttons.

| prop | type | |
|---|---|---|
| `value` | `number` | |
| `setvalue` | `(value: number) => void` | |
| `min?`, `max?` | `number` | bounds of the buttons |
| `step?` | `number` | default 1 |
| `decimals?` | `number` | default: the decimals of `step` |
| `class?`, `disabled?` | | |

```tsx
<NumberStepper value={m.price} setvalue={c.setprice} min={0} max={100} step={0.5} />
```

- The buttons stop at `min` and `max`, but only while the value is inside them. Typed text may leave the range, from where the buttons step freely.
- The text is committed on Enter or blur. A comma is accepted as the decimal separator, invalid text reverts to the current value, valid text is rounded to `decimals`.
- Keys: Enter commits, Escape reverts, ArrowUp or `+` and ArrowDown or `-` commit the pending text and step. Other characters than digits, `.` and `,` are not accepted.
- A button steps when it is pressed, not when it is released, and commits pending text first. Held, it repeats after 400ms, every 80ms. The repeat is a CSS animation on `:active`, whose `animationiteration` events step: so your CSS must not set `animation` on these buttons, and a reset that cuts all animations short (for reduced motion) leaves one step per press.
- `setvalue` is called only with a new value: a button held at `min` or `max` doesn't call it again.

## RangeSlider

A styled native range input.

| prop | type | |
|---|---|---|
| `value` | `number` | |
| `setvalue` | `(value: number) => void` | called while dragging |
| `min?`, `max?`, `step?` | `number` | |
| `class?`, `disabled?` | | |

```tsx
<RangeSlider value={m.volume} setvalue={c.setvolume} min={0} max={100} />
```

It combines with `NumberStepper`: both take the same `value` and `setvalue`, so they can edit one model field side by side.

## Select

A native select over any items. It hands out the item, not text.

| prop | type | |
|---|---|---|
| `items` | `T[]` | |
| `value` | `T \| undefined` | |
| `setvalue` | `(item: T) => void` | |
| `label?` | `(item: T) => string` | default `String(item)` |
| other | select attributes | `disabled`, `name`, ... |

```tsx
<Select items={m.trains} value={m.train} setvalue={c.settrain} label={t => t.name} />
```

A `value` that is not in `items`, or `undefined`, shows nothing selected. Items are found by position, so two items with the same label are fine.

## ComboBox

A text input with a dropdown of suggestions. Any text is allowed, the suggestions only help.

| prop | type | |
|---|---|---|
| `items` | `string[]` | the suggestions |
| `value` | `string` | |
| `setvalue` | `(value: string) => void` | called on every input, and when an item is picked |
| other | input attributes | `placeholder`, `disabled`, ... |

```tsx
<ComboBox items={m.cities} value={m.city} setvalue={c.setcity} placeholder='city' />
```

- Clicking the input, the arrow button or ArrowDown opens the list with **all** items, also when the text matches one.
- Typing narrows the list to the items that contain the text, ignoring case. When nothing matches, no list is shown.
- Keys: ArrowDown and ArrowUp highlight (and wrap around), Enter picks the highlighted item, Escape closes, Enter with nothing highlighted just closes.
- Leaving the input closes the list.

Use [DataListInput](#datalistinput) instead for the browser's own suggestions: simpler, and better on mobile.

## DataListInput

A text input with the browser's own suggestions: a native `<input>` with a `<datalist>`. Same props as `ComboBox`.

```tsx
<DataListInput items={m.cities} value={m.city} setvalue={c.setcity} />
```

- The browser narrows the suggestions to those matching the text. With a filled-in value it shows only that one. This cannot be changed. If it gets in the way, use `ComboBox`.
- It looks and works the way the user's browser or phone does it, with no code of ours for the list.
- The input finds its list by id, so every instance creates a unique one.

## Checkbox

A checkbox with a third state, for a group of which only some are checked. The label is the content of the component.

| prop | type | |
|---|---|---|
| `checked` | `boolean \| 'mixed'` | |
| `setchecked` | `(checked: boolean) => void` | |
| `round?` | `boolean` | round instead of square |
| children | | the label |
| other | input attributes | `disabled`, `name`, ... |

```tsx
const state = checked == 0 ? false : checked == all ? true : 'mixed' // a plain function of the model

<Checkbox checked={state} setchecked={c.setall} round>all</Checkbox>
```

- A click on `'mixed'` hands out `true`, a click on `true` hands out `false`.
- `'mixed'` is the native `indeterminate` state.
- `class` and `style` go to the label. A color for one checkbox is `style='--jmc-accent: red'`.

## ToggleGroup

A row of buttons of which exactly one is selected: a segmented control.

| prop | type | |
|---|---|---|
| `items` | `T[]` | |
| `value` | `T \| undefined` | |
| `setvalue` | `(item: T) => void` | |
| `label?` | `(item: T) => any` | text or a view such as an `Icon`, default `String(item)` |
| `class?`, `disabled?` | | |

```tsx
<ToggleGroup items={['list', 'grid']} value={m.layout} setvalue={c.setlayout} />
<ToggleGroup items={m.modes} value={m.mode} setvalue={c.setmode} label={i => <Icon icon={icons[i]} />} />
```

The items are real buttons, so Tab and Enter work. The buttons have `role="radio"`, the group `role="radiogroup"`.

## RadioGroup

Native radio inputs, one per item, in a row.

| prop | type | |
|---|---|---|
| `items` | `T[]` | |
| `value` | `T \| undefined` | |
| `setvalue` | `(item: T) => void` | |
| `label?` | `(item: T) => any` | default `String(item)` |
| `color?` | `(item: T) => string \| undefined` | tints the radio of the item |
| `class?`, `disabled?` | | |

```tsx
<RadioGroup items={m.groups} value={m.group} setvalue={c.setgroup} color={g => colors[g]} />
```

Radios belong to one group by name, so every instance creates a unique one. The arrow keys move within the group, as with any native radios. Use `ToggleGroup` instead for a segmented look.

## Tabs

The tab bar only. The content below it belongs to your app, which shows what the selected tab says.

| prop | type | |
|---|---|---|
| `items` | `T[]` | |
| `value` | `T \| undefined` | |
| `setvalue` | `(item: T) => void` | |
| `label?` | `(item: T) => any` | default `String(item)` |
| `class?` | | |

```tsx
<Tabs items={m.pages} value={m.page} setvalue={c.gotopage} />
{m.page == 'events' ? <Events /> : <Week />}
```

The tabs are buttons with `role="tab"`, the bar has `role="tablist"`.

## Icon

An `<svg>` icon from an icon node in the format of [lucide](https://lucide.dev), drawn in the text color. jmc has no dependency on lucide: import the nodes from lucide, or write them as a list of `[tag, attributes]`.

| prop | type | |
|---|---|---|
| `icon` | `IconNode` | `[tag, attributes][]` |
| `size?` | `number` | px, default 18 |
| `stroke?` | `number` | default 2 |
| `class?` | | |

```tsx
import { Eye } from 'lucide'

<Icon icon={Eye} size={24} />
```
