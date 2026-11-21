// tsc does not copy stylesheets. the components import them, so they must sit next to the compiled js in dist
import { cpSync } from 'node:fs'

cpSync('src/comps', 'dist/comps', { recursive: true, filter: f => !f.includes('.') || f.endsWith('.css') })
