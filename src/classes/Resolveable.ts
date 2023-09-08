export type ResolveableOptions = Record<never, never>

export type ResolveableStatus = 'ready' | 'resolving' | 'resolved' | 'errored'

/**
 * [Docs](https://baleada.dev/docs/logic/classes/resolveable)
 */
export class Resolveable<Value> {
  constructor (getPromise: () => Promise<Value>, options: ResolveableOptions = {}) {
    this.setGetPromise(getPromise)
    this.ready()
  }
  private computedStatus: ResolveableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get getPromise () {
    return this.computedGetPromise
  }
  set getPromise (getPromise) {
    this.setGetPromise(getPromise)
  }
  get status () {
    return this.computedStatus
  }
  get value () { 
    return this.computedValue
  }
  get error () { 
    return this.computedError
  }

  private computedGetPromise: () => Promise<Value>
  setGetPromise (getPromise: () => Promise<Value>) {
    this.computedGetPromise = getPromise
    return this
  }

  private computedValue: Value
  private computedError: Error
  async resolve () {
    this.resolving()
    try {
      this.computedValue = await this.getPromise()
      this.resolved()
    } catch (error) {
      this.computedError = error
      this.errored()    
    }
    
    return this
  }
  private resolving () {
    this.computedStatus = 'resolving'
  }
  private resolved () {
    this.computedStatus = 'resolved'
  }
  private errored () {
    this.computedStatus = 'errored'
  }
}
