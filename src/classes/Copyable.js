export class Copyable {
  /**
   * @param {string} string
   * @param {{ clipboard?: { text: string } }} [options]
   */
  constructor (string, options = {}) {
    this._clipboard = options.clipboard
    this.setString(string)
    this._ready()
  }
  _ready () {
    /**
     * @type {'ready' | 'copying' | 'copied' | 'errored'}
     */
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
  // TODO: Test this, including in firefox
  get isClipboardText () {
    return this._clipboard
      ? this._clipboard.text === this.string
      : (async () => await navigator.clipboard.readText() === this.string)()
  }
  get response () {
    return this._computedResponse
  }
  
  /**
   * @param {string} string 
   */
  setString (string) {
    this._computedString = string
    return this
  }
  
  /**
   * @param {{ type?: 'clipboard' | 'deprecated' }} [options]
   */
  async copy (options = {}) {    
    this._copying()
    
    const { type = 'clipboard' } = options

    switch (type) {
      case 'clipboard':
        try {
          this._computedResponse = await navigator.clipboard.writeText(this.string)
          
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
