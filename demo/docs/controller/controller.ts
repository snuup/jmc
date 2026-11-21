import { rebind, updateview } from '@snupo/jmc'
import { m } from '../model/model'

class Controller {
    setnote(x: string) { m.textarea.note = x; updateview() }
    setprice(x: number) { m.numberstepper.price = x; updateview() }
    setvolume(x: number) { m.rangeslider.volume = x; updateview() }
    settrain(x: { name: string }) { m.select.train = x; updateview() }
    setcity(x: string) { m.combobox.city = x; updateview() }
    setdatalistcity(x: string) { m.datalistinput.city = x; updateview() }

    setchecked(item: string, checked: boolean) { m.checkbox.items[item] = checked; updateview() }
    setallchecked(checked: boolean) {
        for (const k in m.checkbox.items) m.checkbox.items[k] = checked
        updateview()
    }

    setlayout(x: string) { m.togglegroup.layout = x; updateview() }
    setmode(x: typeof m.togglegroup.mode) { m.togglegroup.mode = x; updateview() }
    setgroup(x: string) { m.radiogroup.group = x; updateview() }
    setpage(x: string) { m.tabs.page = x; updateview() }

    seticonsize(x: number) { m.icon.size = x; updateview() }
    seticonstroke(x: number) { m.icon.stroke = x; updateview() }
}

export const c = rebind(new Controller())
