export class Copyable {
  _clipboard: { text: string }

  constructor (string: string, options: { clipboard?: { text: string } } = {}) {
    this._clipboard = options.clipboard
    this.setString(string)
    this._ready()
  }
  _computedStatus: 'ready' | 'copying' | 'copied' | 'errored'
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
    return this._clipboard
      ? this._clipboard.text === this.string
      : (async () => await navigator.clipboard.readText() === this.string)()
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
          
          if (this._clipboard) {
            this._clipboard.text = this.string
          }
          
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

        if (this._clipboard) {
          this._clipboard.text = this.string
        }

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
}
