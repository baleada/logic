/*
* Grantable.js
* (c) 2019-present Alex Vipond
* Released under the MIT license
*/

export default class Grantable {
  constructor (descriptor, options = {}) {
    this.setDescriptor(descriptor)
    this._computedPermission = {}
    this._ready()
  }
  _ready () {
    this._computedStatus = 'ready'
  }
  
  get descriptor () {
    return this._computedDescriptor
  }
  set descriptor (descriptor) {
    this.setDescriptor(descriptor)
  }
  get permission () {
    return this._computedPermission
  }
  get status () {
    return this._computedStatus
  }
  
  setDescriptor (descriptor) {
    this._computedDescriptor = descriptor
    return this
  }

  async query () {
    this._querying()

    try {
      this._computedPermission = await navigator.permissions.query(this.descriptor)
      this._queried()
    } catch (error) {
      this._computedPermission = error
      this._errored()
    }

    return this
  }  
  _querying () {
    this._computedStatus = 'querying'
  }
  _queried () {
    this._computedStatus = 'queried'
  }
  _errored () {
    this._computedStatus = 'errored'
  }
}
