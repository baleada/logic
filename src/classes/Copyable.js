import Resolveable from './Resolveable.js'

export default class Copyable {
  constructor (string, options = {}) {
    this.setString(string)
    this._computedCopied = new Resolveable(() => navigator.clipboard.readText())
    this._ready()
  }
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
  // TODO: Test this, including in firefox
  get copied () {
    return this._computedCopied.resolve()
  }
  get response () {
    return this._computedResponse
  }
  
  setString (string) {
    this._computedString = string
    return this
  }
  
  async copy (options = {}) {    
    this._copying()
    
    const { type = 'clipboard' } = options

    switch (type) {
      case 'clipboard':
        try {
          this._computedResponse = await navigator.clipboard.writeText(this.string)
          this._copied()
        } catch (error) {
          this._computedResponse = error
          this._errored()
        }
        
        break
      case 'element':
        const input = document.createElement('input')
        input.type = 'text'
        input.value = this.string
        
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        
        document.body.removeChild(input)

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
