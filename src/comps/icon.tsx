import { jsx } from '../h.js'
import { cc } from '../lib.js'
import './icon.css'

/** the icon format of lucide (IconNode): a list of [tag, attributes] */
export type IconNode = [tag: string, attrs: Record<string, string | number>][]

/** an svg icon from a lucide icon node. it is drawn in the text color and sized by size, in px */
export const Icon = ({ icon, size = 18, stroke = 2, class: cls }: { icon: IconNode, size?: number, stroke?: number, class?: string }) =>
    <svg class={cc('jmc-icon', cls)} xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24'
        fill='none' stroke='currentColor' stroke-width={stroke} stroke-linecap='round' stroke-linejoin='round'>
        {icon.map(([tag, attrs]) => jsx(tag, attrs))}
    </svg>
