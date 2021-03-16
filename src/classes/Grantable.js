export default class Grantable {
  /**
   * 
   * @param {PermissionDescriptor | DevicePermissionDescriptor | MidiPermissionDescriptor | PushPermissionDescriptor} descriptor
   * @param {{}} [options]
   */
  constructor (descriptor, options = {}) {
    this.setDescriptor(descriptor)
    this._ready()
  }
  _ready () {
    /**
     * @type {'ready' | 'querying' | 'queried' | 'errored'}
     */
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
  
  /**
   * @param {PermissionDescriptor | DevicePermissionDescriptor | MidiPermissionDescriptor | PushPermissionDescriptor} descriptor
   */
  setDescriptor (descriptor) {
    this._computedDescriptor = descriptor
    return this
  }

  async query () {
    this._querying()

    try {
      /**
       * @type {PermissionStatus | Error}
       */
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
