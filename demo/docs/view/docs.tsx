import { Checkbox, ComboBox, DataListInput, Icon, NumberStepper, RadioGroup, RangeSlider, Select, Tabs, TextArea, ToggleGroup } from '@snupo/jmc/comps'
import { m } from '../model/model'
import { checkedstate } from '../model/derived'
import { c } from '../controller/controller'
import { ArrowLeftRight, ArrowUpDown, Eye } from '../../shared/icons'

/** `text` between backticks becomes <code> */
const rich = (s: string) => s.split('`').map((t, i) => i % 2 ? <code>{t}</code> : t)

type Row = [prop: string, type: string, note?: string]

const Props = ({ rows }: { rows: Row[] }) =>
    <div class='tablewrap'>
        <table>
            <tr><th>prop</th><th>type</th><th /></tr>
            {rows.map(([prop, type, note]) =>
                <tr><td><code>{prop}</code></td><td><code>{type}</code></td><td>{rich(note ?? '')}</td></tr>)}
        </table>
    </div>

/** one component: text, props, the live example next to its own slice of the model, the code and notes */
const Doc = ({ name, intro, rows, code, notes, model, children }:
    { name: string, intro: string, rows?: Row[], code: string, notes?: string[], model: object, children?: any }) =>
    <article id={name.toLowerCase()}>
        <h2>{name}</h2>
        <p>{rich(intro)}</p>
        <div class='live'>
            <div class='example'>{children}</div>
            <pre class='model'>{JSON.stringify(model, null, 2)}</pre>
        </div>
        {rows && <Props rows={rows} />}
        <pre><code>{code}</code></pre>
        {notes && <ul>{notes.map(n => <li>{rich(n)}</li>)}</ul>}
    </article>

const names = ['TextArea', 'NumberStepper', 'RangeSlider', 'Select', 'ComboBox', 'DataListInput', 'Checkbox', 'ToggleGroup', 'RadioGroup', 'Tabs', 'Icon']

export const Docs = () =>
    <main>
        <h1>jmc components</h1>
        <p>
            A small set of ready-made input components for jmc apps. They are light DOM only (no Shadow DOM), wrap the native elements, and
            follow the architecture of the design guide: the value lives in the model, the component shows it, and a controller method changes it.
            Every example below is live and has its own slice of one model, shown on the right.
        </p>

        <pre><code>{`import { NumberStepper } from '@snupo/jmc/comps'

<NumberStepper value={m.count} setvalue={c.setcount} min={0} max={10} />

// controller
setcount(x: number) { m.count = x; updateview() }`}</code></pre>

        <p>Each component imports its own stylesheet, so your bundler must handle CSS imports (Vite and webpack do). Import from <code>@snupo/jmc/comps</code>, or a single component from <code>@snupo/jmc/comps/numberstepper</code>.</p>

        <nav>{names.map(n => <a href={'#' + n.toLowerCase()}>{n}</a>)}</nav>

        <h2>Rules for all components</h2>
        <ul>
            {[
                '**`value` and `setvalue`.** The component shows `value` and calls `setvalue(newvalue)` when the user changes it. It hands out values (a string, a number, an item), never the DOM event. `setvalue` is a controller method, which changes the model and updates the view.',
                '**The model decides.** A component never keeps its own copy of the value. If the controller refuses a change, the component shows the old value again.',
                '**Own state only for the UI.** `ComboBox` keeps whether its list is open, `NumberStepper` the text you are typing. Nothing else needs it.',
                '**`class` and `disabled`.** All input components take `class`. All of them can be disabled.',
                '**Other attributes.** `TextArea`, `Select`, `ComboBox`, `DataListInput` and `Checkbox` pass every other standard attribute on to the native element. `Checkbox` sends `class` and `style` to its label.',
                '**Items.** `Select`, `ToggleGroup`, `RadioGroup` and `Tabs` work on any items, not only strings. They hand out the item itself. `label(item)` sets what is shown, the default is `String(item)`.',
                '**Timing.** `Select` and `TextArea` finish their work (the selected option, the height) in a microtask after the render.',
            ].map(t => <li>{t.split('**').map((p, i) => i % 2 ? <b>{rich(p)}</b> : rich(p))}</li>)}
        </ul>

        <h3>Styling</h3>
        <p>Class names start with <code>jmc-</code> and all rules are in the CSS layer <code>jmc</code>, so any CSS of your app wins without specificity fights. Colors and sizes are CSS variables with defaults. Set them on <code>:root</code>, or on one element to change only the components below it.</p>
        <Props rows={[
            ['--jmc-color', 'text color'], ['--jmc-bg', 'background of inputs'], ['--jmc-border', 'border color'], ['--jmc-radius', 'corner radius'],
            ['--jmc-padding', 'padding of inputs and buttons'], ['--jmc-accent', 'focus and selection color'], ['--jmc-bg-focus', 'hover and focus background'],
            ['--jmc-bg-button', 'button background of NumberStepper'], ['--jmc-stepper-width', 'width of NumberStepper'],
            ['--jmc-slider-width, --jmc-track-height, --jmc-track, --jmc-thumb, --jmc-thumb-size', 'RangeSlider'],
            ['--jmc-checkbox-radius', 'corner radius of Checkbox'],
        ].map(([a, b]) => [a, b] as Row)} />

        <Doc name='TextArea' model={m.textarea}
            intro='A textarea that grows and shrinks with its text. Use it where a text can have several lines and you don’t want a scrollbar.'
            rows={[['value', 'string'], ['setvalue?', '(value: string) => void', 'called on every input'], ['other', 'textarea attributes', '`placeholder`, `disabled`, `rows` (default 1), ...']]}
            code={`<TextArea value={m.note} setvalue={c.setnote} placeholder='a note' />`}
            notes={[
                'The height follows the text when the user types, when the model changes the value, and when the width changes.',
                'A hidden textarea is adjusted once it is shown. `autofocus` focuses it when it is mounted.',
                'Browsers that support `field-sizing: content` can do this in CSS alone.',
            ]}>
            <TextArea value={m.textarea.note} setvalue={c.setnote} placeholder='a note' />
        </Doc>

        <Doc name='NumberStepper' model={m.numberstepper}
            intro='A number input with minus and plus buttons.'
            rows={[['value', 'number'], ['setvalue', '(value: number) => void'], ['min?, max?', 'number', 'bounds of the buttons'], ['step?', 'number', 'default 1'],
                ['decimals?', 'number', 'default: the decimals of `step`'], ['class?, disabled?', '']]}
            code={`<NumberStepper value={m.price} setvalue={c.setprice} min={0} max={100} step={0.5} />`}
            notes={[
                'The buttons stop at `min` and `max`, but only while the value is inside them. Typed text may leave the range, from where the buttons step freely.',
                'The text is committed on Enter or blur. A comma is accepted as the decimal separator, invalid text reverts to the current value, valid text is rounded to `decimals`.',
                'Keys: Enter commits, Escape reverts, ArrowUp or `+` and ArrowDown or `-` commit the pending text and step. Other characters than digits, `.` and `,` are not accepted.',
            ]}>
            <NumberStepper value={m.numberstepper.price} setvalue={c.setprice} min={0} max={100} step={0.5} />
        </Doc>

        <Doc name='RangeSlider' model={m.rangeslider}
            intro='A styled native range input. It combines with `NumberStepper`: both take the same `value` and `setvalue`, so they can edit one model field side by side.'
            rows={[['value', 'number'], ['setvalue', '(value: number) => void', 'called while dragging'], ['min?, max?, step?', 'number'], ['class?, disabled?', '']]}
            code={`<RangeSlider value={m.volume} setvalue={c.setvolume} min={0} max={100} />
<NumberStepper value={m.volume} setvalue={c.setvolume} min={0} max={100} />`}>
            <RangeSlider value={m.rangeslider.volume} setvalue={c.setvolume} min={0} max={100} />
            <NumberStepper value={m.rangeslider.volume} setvalue={c.setvolume} min={0} max={100} />
        </Doc>

        <Doc name='Select' model={m.select}
            intro='A native select over any items. It hands out the item, not text.'
            rows={[['items', 'T[]'], ['value', 'T | undefined'], ['setvalue', '(item: T) => void'], ['label?', '(item: T) => string', 'default `String(item)`'], ['other', 'select attributes', '`disabled`, `name`, ...']]}
            code={`<Select items={m.trains} value={m.train} setvalue={c.settrain} label={t => t.name} />`}
            notes={['A `value` that is not in `items`, or `undefined`, shows nothing selected. Items are found by position, so two items with the same label are fine.']}>
            <Select items={m.select.trains} value={m.select.train} setvalue={c.settrain} label={t => t.name} />
        </Doc>

        <Doc name='ComboBox' model={m.combobox}
            intro='A text input with a dropdown of suggestions. Any text is allowed, the suggestions only help.'
            rows={[['items', 'string[]', 'the suggestions'], ['value', 'string'], ['setvalue', '(value: string) => void', 'called on every input, and when an item is picked'], ['other', 'input attributes', '`placeholder`, `disabled`, ...']]}
            code={`<ComboBox items={m.cities} value={m.city} setvalue={c.setcity} placeholder='city' />`}
            notes={[
                'Clicking the input, the arrow button or ArrowDown opens the list with **all** items, also when the text matches one.',
                'Typing narrows the list to the items that contain the text, ignoring case. When nothing matches, no list is shown.',
                'Keys: ArrowDown and ArrowUp highlight (and wrap around), Enter picks the highlighted item, Escape closes, Enter with nothing highlighted just closes.',
                'Leaving the input closes the list. Use `DataListInput` instead for the browser’s own suggestions: simpler, and better on mobile.',
            ]}>
            <ComboBox items={m.combobox.cities} value={m.combobox.city} setvalue={c.setcity} placeholder='city' />
        </Doc>

        <Doc name='DataListInput' model={m.datalistinput}
            intro='A text input with the browser’s own suggestions: a native `<input>` with a `<datalist>`. Same props as `ComboBox`.'
            code={`<DataListInput items={m.cities} value={m.city} setvalue={c.setcity} />`}
            notes={[
                'The browser narrows the suggestions to those matching the text. With a filled-in value it shows only that one. This cannot be changed. If it gets in the way, use `ComboBox`.',
                'It looks and works the way the user’s browser or phone does it, with no code of ours for the list.',
                'The input finds its list by id, so every instance creates a unique one.',
            ]}>
            <DataListInput items={m.datalistinput.cities} value={m.datalistinput.city} setvalue={c.setdatalistcity} placeholder='city' />
        </Doc>

        <Doc name='Checkbox' model={m.checkbox}
            intro='A checkbox with a third state, for a group of which only some are checked. The label is the content of the component.'
            rows={[['checked', "boolean | 'mixed'"], ['setchecked', '(checked: boolean) => void'], ['round?', 'boolean', 'round instead of square'], ['children', '', 'the label'], ['other', 'input attributes', '`disabled`, `name`, ...']]}
            code={`const state = checked == 0 ? false : checked == all ? true : 'mixed' // a plain function of the model

<Checkbox checked={state} setchecked={c.setall} round>all</Checkbox>`}
            notes={[
                'A click on `mixed` hands out `true`, a click on `true` hands out `false`. `mixed` is the native `indeterminate` state.',
                '`class` and `style` go to the label. A color for one checkbox is `style=\'--jmc-accent: red\'`.',
            ]}>
            <Checkbox checked={checkedstate()} setchecked={c.setallchecked} round>all</Checkbox>
            {Object.keys(m.checkbox.items).map(i =>
                <Checkbox checked={m.checkbox.items[i]} setchecked={x => c.setchecked(i, x)} style={`--jmc-accent:${i}`}>{i}</Checkbox>)}
        </Doc>

        <Doc name='ToggleGroup' model={m.togglegroup}
            intro='A row of buttons of which exactly one is selected: a segmented control.'
            rows={[['items', 'T[]'], ['value', 'T | undefined'], ['setvalue', '(item: T) => void'], ['label?', '(item: T) => any', 'text or a view such as an `Icon`, default `String(item)`'], ['class?, disabled?', '']]}
            code={`<ToggleGroup items={['list', 'grid']} value={m.layout} setvalue={c.setlayout} />
<ToggleGroup items={m.modes} value={m.mode} setvalue={c.setmode} label={i => <Icon icon={icons[i]} />} />`}
            notes={['The items are real buttons, so Tab and Enter work. The buttons have `role="radio"`, the group `role="radiogroup"`.']}>
            <ToggleGroup items={m.togglegroup.layouts} value={m.togglegroup.layout} setvalue={c.setlayout} />
            <ToggleGroup items={m.togglegroup.modes} value={m.togglegroup.mode} setvalue={c.setmode}
                label={i => <Icon icon={i == 'vertical' ? ArrowUpDown : ArrowLeftRight} />} />
        </Doc>

        <Doc name='RadioGroup' model={m.radiogroup}
            intro='Native radio inputs, one per item, in a row.'
            rows={[['items', 'T[]'], ['value', 'T | undefined'], ['setvalue', '(item: T) => void'], ['label?', '(item: T) => any', 'default `String(item)`'],
                ['color?', '(item: T) => string | undefined', 'tints the radio of the item'], ['class?, disabled?', '']]}
            code={`<RadioGroup items={m.groups} value={m.group} setvalue={c.setgroup} color={g => colors[g]} />`}
            notes={['Radios belong to one group by name, so every instance creates a unique one. The arrow keys move within the group, as with any native radios. Use `ToggleGroup` instead for a segmented look.']}>
            <RadioGroup items={m.radiogroup.groups} value={m.radiogroup.group} setvalue={c.setgroup}
                color={g => ({ trains: '#dc2626', buses: '#2563eb', trams: '#16a34a' } as Record<string, string>)[g]} />
        </Doc>

        <Doc name='Tabs' model={m.tabs}
            intro='The tab bar only. The content below it belongs to your app, which shows what the selected tab says.'
            rows={[['items', 'T[]'], ['value', 'T | undefined'], ['setvalue', '(item: T) => void'], ['label?', '(item: T) => any', 'default `String(item)`'], ['class?', '']]}
            code={`<Tabs items={m.pages} value={m.page} setvalue={c.gotopage} />
{m.page == 'events' ? <Events /> : <Week />}`}
            notes={['The tabs are buttons with `role="tab"`, the bar has `role="tablist"`.']}>
            <Tabs items={m.tabs.pages} value={m.tabs.page} setvalue={c.setpage} />
            <p>content of the page “{m.tabs.page}”</p>
        </Doc>

        <Doc name='Icon' model={m.icon}
            intro='An `<svg>` icon from an icon node in the format of lucide, drawn in the text color. jmc has no dependency on lucide: import the nodes from lucide, or write them as a list of `[tag, attributes]`.'
            rows={[['icon', 'IconNode', '`[tag, attributes][]`'], ['size?', 'number', 'px, default 18'], ['stroke?', 'number', 'default 2'], ['class?', '']]}
            code={`import { Eye } from 'lucide'

<Icon icon={Eye} size={24} />`}>
            <Icon icon={Eye} size={m.icon.size} stroke={m.icon.stroke} />
            <NumberStepper value={m.icon.size} setvalue={c.seticonsize} min={8} max={64} step={4} />
            <NumberStepper value={m.icon.stroke} setvalue={c.seticonstroke} min={0.5} max={4} step={0.5} />
        </Doc>
    </main>
