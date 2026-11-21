import { mount, patch } from '@snupo/jmc'
import { m } from './model/model'
import { c } from './controller/controller'
import { Docs } from './view/docs'
import './docs.css'

mount({ m, c }) // for the browser console
patch(document.body, <body><Docs /></body>)
