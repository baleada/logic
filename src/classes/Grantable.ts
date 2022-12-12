export type GrantableOptions = Record<never, never>

export type GrantableStatus = 'ready' | 'querying' | 'queried' | 'errored'

export class Grantable<DescriptorType extends PermissionDescriptor> {
  constructor (descriptor: DescriptorType, options: GrantableOptions = {}) {
    this.setDescriptor(descriptor)
    this.ready()
  }
  private computedStatus: GrantableStatus
  private ready () {
    this.computedStatus = 'ready'
  }
  
  get descriptor () {
    return this.computedDescriptor
  }
  set descriptor (descriptor) {
    this.setDescriptor(descriptor)
  }
  get permission () {
    return this.computedPermission
  }
  get status () {
    return this.computedStatus
  }
  
  private computedDescriptor: DescriptorType
  setDescriptor (descriptor: DescriptorType) {
    this.computedDescriptor = descriptor
    return this
  }

  private computedPermission: PermissionStatus | Error
  async query () {
    this.querying()

    try {
      this.computedPermission = await navigator.permissions.query(this.descriptor)
      this.queried()
    } catch (error) {
      this.computedPermission = error as Error
      this.errored()
    }

    return this
  }  
  private querying () {
    this.computedStatus = 'querying'
  }
  private queried () {
    this.computedStatus = 'queried'
  }
  private errored () {
    this.computedStatus = 'errored'
  }
}
