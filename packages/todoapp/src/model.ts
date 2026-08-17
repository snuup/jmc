type Id = string

export type Todo = {
    id: Id
    text: string
    completed: boolean
}

export let m = {

    items: [
        {
            id: "123",
            completed: false,
            text: "hasentodo"
        }
    ] as Todo[],

    editingItem: null as Todo | null,
    filter: "all" as Filter,

    get filtereditems() {
        switch (this.filter) {
            case "all": return this.items
            case "active": return this.activeitems
            case "completed": return this.items.filter(t => t.completed)
        }
    },

    get activeitems() { return this.items.filter(t => !t.completed) },
    get activecount() { return this.activeitems.length },
    get allarecompleted() { return this.items.every(t => t.completed) },
    get anycompleted() { return this.items.some(t => t.completed) },
}