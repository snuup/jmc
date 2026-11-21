import { Checkbox, ComboBox, DataListInput, Icon, NumberStepper, RadioGroup, RangeSlider, Select, Tabs, TextArea, ToggleGroup } from '@snupo/jmc/comps'
import { m } from '../model/model'
import { checkedstate } from '../model/derived'
import { c } from '../controller/controller'
import { ArrowLeftRight, ArrowUpDown, Eye } from './icons'

const colors: Record<string, string> = { trains: '#dc2626', buses: '#2563eb', trams: '#16a34a', ferries: '#9333ea' }

const Demo = ({ name, fields, children }: { name: string, fields: string, children?: any }) =>
    <section>
        <h2>{name} <small>{fields}</small></h2>
        {children}
    </section>

export const Gallery = () =>
    <main>
        <h1>jmc components</h1>
        <p>All components share a few fields of one model. Change one, the others follow.</p>
        <p><Checkbox checked={m.disabled} setchecked={c.toggledisabled}>disable the inputs</Checkbox></p>

        <Tabs items={m.categories} value={m.category} setvalue={c.setcategory} />

        <Demo name='NumberStepper, RangeSlider, ToggleGroup' fields='m.value'>
            <NumberStepper value={m.value} setvalue={c.setvalue} min={0} max={100} step={5} disabled={m.disabled} />
            <RangeSlider value={m.value} setvalue={c.setvalue} min={0} max={100} step={1} disabled={m.disabled} />
            <ToggleGroup items={m.presets} value={m.value} setvalue={c.setvalue} disabled={m.disabled} />
        </Demo>

        <Demo name='Select, ComboBox, DataListInput, RadioGroup, ToggleGroup, Tabs' fields='m.category'>
            <Select items={m.categories} value={m.category} setvalue={c.setcategory} disabled={m.disabled} />
            <ComboBox items={m.categories} value={m.category ?? ''} setvalue={c.setcategory} placeholder='any text' disabled={m.disabled} />
            <DataListInput items={m.categories} value={m.category ?? ''} setvalue={c.setcategory} placeholder='native list' disabled={m.disabled} />
            <RadioGroup items={m.categories} value={m.category} setvalue={c.setcategory} color={i => colors[i]} disabled={m.disabled} />
            <ToggleGroup items={m.categories} value={m.category} setvalue={c.setcategory} disabled={m.disabled} />
        </Demo>

        <Demo name='Checkbox, tri-state' fields='m.checked'>
            <Checkbox checked={checkedstate()} setchecked={c.setallchecked} round disabled={m.disabled}>all</Checkbox>
            {m.categories.map(i =>
                <Checkbox checked={m.checked[i]} setchecked={x => c.setchecked(i, x)} disabled={m.disabled} style={`--jmc-accent:${colors[i]}`}>{i}</Checkbox>)}
        </Demo>

        <Demo name='ToggleGroup with icons' fields='m.direction'>
            <ToggleGroup items={['vertical', 'horizontal'] as const} value={m.direction} setvalue={c.setdirection} disabled={m.disabled}
                label={i => <Icon icon={i == 'vertical' ? ArrowUpDown : ArrowLeftRight} />} />
            <Icon icon={Eye} size={28} stroke={1.5} />
        </Demo>

        <Demo name='TextArea, twice' fields='m.note'>
            <TextArea value={m.note} setvalue={c.setnote} disabled={m.disabled} />
            <TextArea value={m.note} setvalue={c.setnote} disabled={m.disabled} />
        </Demo>

        <h2>the model</h2>
        <pre>{JSON.stringify(m, null, 2)}</pre>
    </main>
