// the state of the components page: one slice per component, so every example shows exactly the state it works on
export const m = {
    textarea: { note: 'This text area grows with its text.\nType more lines.' },

    // the stepper and the slider edit the same field
    numberstepper: { price: 2.5 },
    rangeslider: { volume: 40 },

    select: {
        trains: [{ name: 'ICE 71' }, { name: 'Railjet 540' }, { name: 'Nightjet 295' }],
        train: undefined as { name: string } | undefined,
    },

    combobox: { cities: ['Vienna', 'Salzburg', 'Graz', 'Linz', 'Innsbruck'], city: '' },
    datalistinput: { cities: ['Vienna', 'Salzburg', 'Graz', 'Linz', 'Innsbruck'], city: '' },

    checkbox: { items: { red: true, green: false, blue: true } as Record<string, boolean> },

    togglegroup: { layouts: ['list', 'grid'], layout: 'list', modes: ['vertical', 'horizontal'] as ('vertical' | 'horizontal')[], mode: 'vertical' as 'vertical' | 'horizontal' },

    radiogroup: { groups: ['trains', 'buses', 'trams'], group: 'buses' as string | undefined },

    tabs: { pages: ['events', 'week', 'settings'], page: 'events' },

    icon: { size: 24, stroke: 2 },
}
