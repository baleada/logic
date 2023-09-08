export type GrantableOptions = Record<never, never>

export type GrantableStatus = 'ready' | 'granting' | 'granted' | 'errored'

/**
 * [Docs](https://baleada.dev/docs/logic/classes/grantable)
 */
export class Grantable {
  constructor (descriptor: PermissionDescriptor, options: GrantableOptions = {}) {
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
  get error () {
    return this.computedError
  }
  get status () {
    return this.computedStatus
  }
  
  private computedDescriptor: PermissionDescriptor
  setDescriptor (descriptor: PermissionDescriptor) {
    this.computedDescriptor = descriptor
    return this
  }

  private computedPermission: PermissionStatus
  private computedError: Error
  async grant () {
    this.granting()

    try {
      this.computedPermission = await navigator.permissions.query(this.descriptor)
      this.granted()
    } catch (error) {
      this.computedError = error
      this.errored()
    }

    return this
  }  
  private granting () {
    this.computedStatus = 'granting'
  }
  private granted () {
    this.computedStatus = 'granted'
  }
  private errored () {
    this.computedStatus = 'errored'
  }
}
