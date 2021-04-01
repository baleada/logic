export class Grantable<DescriptorType extends PermissionDescriptor> {
  constructor (descriptor: DescriptorType, options: {} = {}) {
    this.setDescriptor(descriptor)
    this._ready()
  }
  _computedStatus: 'ready' | 'querying' | 'queried' | 'errored'
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
  
  _computedDescriptor: DescriptorType
  setDescriptor (descriptor: DescriptorType) {
    this._computedDescriptor = descriptor
    return this
  }

  _computedPermission: PermissionStatus | Error
  async query () {
    this._querying()

    try {
      this._computedPermission = await navigator.permissions.query(this.descriptor)
      this._queried()
    } catch (error) {
      this._computedPermission = error as Error
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
