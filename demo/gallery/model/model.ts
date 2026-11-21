// the state of the gallery. every field is shown by several components, so a change in one shows up in the others
export const m = {
    /** number 0..100: the stepper, the slider and the presets */
    value: 40,
    presets: [0, 25, 50, 75, 100],

    /** one of categories, or any text typed into the combo box: the tabs, select, combo box, radio group and toggle group */
    category: 'trains' as string | undefined,
    categories: ['trains', 'buses', 'trams', 'ferries'],

    /** which categories are checked: the checkboxes, and the tri-state one over all of them */
    checked: { trains: true, buses: false, trams: true, ferries: false } as Record<string, boolean>,

    /** shown by two text areas */
    note: 'This text area grows with its text.\nType more lines.',

    direction: 'vertical' as 'vertical' | 'horizontal',

    /** disables the inputs */
    disabled: false,
}
