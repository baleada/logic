import { Listenable } from "./Listenable"
import type { ListenEffect } from './Listenable'

export type CopyableOptions = Record<string, never>

// TODO: Listen for window copy events to update status

export type CopyableStatus = 'ready' | 'copying' | 'copied' | 'errored'

export class Copyable {
  _computedIsClipboardText: boolean
  _copy: Listenable<'copy'>
  _cut: Listenable<'cut'>
  _copyAndCutEffect: ListenEffect<'copy' | 'cut'>

  constructor (string: string, options: CopyableOptions = {}) {
    this._computedIsClipboardText = false

    this._copy = new Listenable('copy')
    this._cut = new Listenable('cut')

    this._copyAndCutEffect = async () => {
      const clipboardText = await navigator.clipboard.readText()
      this._computedIsClipboardText = clipboardText === this.string
    }

    this.setString(string)
    this._ready()
  }
  _computedStatus: CopyableStatus
  _ready () {
    this._computedStatus = 'ready'
  }
  
  get string () {
    return this._computedString
  }
  set string (string) {
    this.setString(string)
  }
  get status () {
    return this._computedStatus
  }
  get isClipboardText () {
    return this._computedIsClipboardText
  }
  get response () {
    return this._computedResponse
  }
  
  _computedString: string
  setString (string: string) {
    this._computedString = string
    return this
  }
  
  _computedResponse: undefined
  async copy (options: { type: 'clipboard' | 'deprecated' } = { type: 'clipboard' }) {    
    this._copying()
    
    const { type } = options

    switch (type) {
      case 'clipboard':
        try {
          this._computedResponse = await navigator.clipboard.writeText(this.string) as undefined
          
          this._computedIsClipboardText = true
          
          this._copied()
        } catch (error) {
          this._computedResponse = error
          this._errored()
        }
        
        break
      case 'deprecated':
        const input = document.createElement('input')
        input.type = 'text'
        input.value = this.string
        
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        
        document.body.removeChild(input)

        this._computedIsClipboardText = true

        this._copied()
        break
    }
    
    return this
  }
  _copying () {
    this._computedStatus = 'copying'
  }
  _copied () {
    this._computedStatus = 'copied'
  }
  _errored () {
    this._computedStatus = 'errored'
  }

  effectClipboardTextChanges () {
    this._copy.listen(this._copyAndCutEffect)
    this._cut.listen(this._copyAndCutEffect)
  }

  stop () {
    this._copy.stop()
    this._cut.stop()
  }
}
