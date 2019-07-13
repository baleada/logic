import GoTrue from 'gotrue-js'

class IdentifiableDependencyWrapper {
  #dependency

  constructor (config) {
    this.#dependency = new GoTrue(config)
  }

  // Utils
  getCurrentUser () {
    return this.#dependency.currentUser(...arguments)
  }

  // Promise-based
  signup () {
    return this.#dependency.signup(...arguments)
  }
  login () {
    return this.#dependency.login(...arguments)
  }
  loginExternalProvider () {
    return this.#dependency.loginExternalUrl(...arguments)
  }
  confirm () {
    return this.#dependency.confirm(...arguments)
  }
  requestPasswordRecovery () {
    return this.#dependency.requestPasswordRecovery(...arguments)
  }
  recover () {
    return this.#dependency.recover(...arguments)
  }
  acceptInvite () {
    return this.#dependency.acceptInvite(...arguments)
  }
  acceptInviteExternalProvider () {
    return this.#dependency.acceptInviteExternalUrl(...arguments)
  }
  update (user, userMetadata) {
    return user.update({
      data: userMetadata,
    })
  }
  getJwt (user) {
    return user.jwt(...Array.from(arguments).slice(1))
  }
  logout (user) {
    return user.logout(...Array.from(arguments).slice(1))
  }
  tokenDetails (user) {
    return user.tokenDetails(...Array.from(arguments).slice(1))
  }
  clearSession (user) {
    return user.clearSession(...Array.from(arguments).slice(1))
  }
}

export default IdentifiableDependencyWrapper
