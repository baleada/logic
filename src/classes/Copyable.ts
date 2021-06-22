export type CopyableOptions = {}

// TODO: Listen for window copy events to update status

export type CopyableStatus = 'ready' | 'copying' | 'copied' | 'errored'

export class Copyable {
  _computedIsClipboardText: boolean

  constructor (string: string, options: CopyableOptions = {}) {
    this._computedIsClipboardText = false

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

  _copyAndCutEventHandle: (event: ClipboardEvent) => void
  handleClipboardTextChanges () {
    this._copyAndCutEventHandle = async () => {
      const text = await navigator.clipboard.readText()
      this._computedIsClipboardText = text === this.string
    }

    window.addEventListener('copy', this._copyAndCutEventHandle)
    window.addEventListener('cut', this._copyAndCutEventHandle)
  }

  stop () {
    window.removeEventListener('copy', this._copyAndCutEventHandle)
    window.removeEventListener('cut', this._copyAndCutEventHandle)
  }
}
