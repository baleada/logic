/*
 * identifiable.js v1.0.0
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

// TODO: dynamically import dependency based on config file
// import config from '~/assets/js/config/identifiable.config.js'
// let dependency = config.dependency
// let IdentifiableDependencyWrapper,
//     log
//
// if (dependency === 'GoTrue') {
//   let module = import('./identifiable-gotrue.js')
//   log = module
// }

import IdentifiableDependencyWrapper from './identifiable-gotrue.js'
import is from './is.js'
import capitalize from './capitalize.js'

class Identifiable {
  #on
  #dependency

  constructor (options) {
    options = {
      identifyConfig: {},
      ...options
    }

    this.#dependency = new IdentifiableDependencyWrapper(options.identifyConfig)

    this.#on = {}
    this.responses = {}

    const promises = [
      'signup',
      'login',
      'loginExternalProvider',
      'confirm',
      'requestPasswordRecovery',
      'recover',
      'acceptInvite',
      'acceptInviteExternalProvider',
      'update',
      'getJwt',
      'logout'
    ]

    promises.forEach(promise => {
      this.responses[promise] = {}
      this.#on[promise] = {}
      this.#on[promise].success = options[`on${capitalize(promise)}Success`]
      this.#on[promise].error = options[`on${capitalize(promise)}Error`]
    })

    this.user = this.#getCurrentUser()
    this.loading = false
  }

  // Utils
  #getCurrentUser = function () {
    return this.#dependency.getCurrentUser()
  }

  // Promise-based
  signup (email, password, data) {
    this.loading = true
    this.#dependency
      .signup(email, password, data)
      .then(response => {
        this.loading = false
        this.responses.signup = response
        this.user = this.#getCurrentUser()
        if (is.function(this.#on.signup.success)) this.#on.signup.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.signup = error
        if (is.function(this.#on.signup.error)) this.#on.signup.error(error)
      })
  }
  login (email, password, remember) {
    this.loading = true
    this.#dependency
      .login(email, password, remember)
      .then(response => {
        this.loading = false
        this.responses.login = response
        this.user = this.#getCurrentUser()
        if (is.function(this.#on.login.success)) this.#on.login.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.login = error
        if (is.function(this.#on.login.error)) this.#on.login.error(error)
      })
  }
  loginExternalProvider (provider) {
    this.loading = true
    this.#dependency
      .loginExternalProvider(provider)
      .then(response => {
        this.loading = false
        this.responses.loginExternalProvider = response
        this.user = this.#getCurrentUser()
        if (is.function(this.#on.loginExternalProvider.success)) this.#on.loginExternalProvider.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.loginExternalProvider = error
        if (is.function(this.#on.loginExternalProvider.error)) this.#on.loginExternalProvider.error(error)
      })
  }
  confirm (token, remember) {
    this.loading = true
    this.#dependency
      .confirm(token, remember)
      .then(response => {
        this.loading = false
        this.responses.confirm = response
        this.user = this.#getCurrentUser()
        if (is.function(this.#on.confirm.success)) this.#on.confirm.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.confirm = error
        if (is.function(this.#on.confirm.error)) this.#on.confirm.error(error)
      })
  }
  requestPasswordRecovery (email) {
    this.loading = true
    this.#dependency
      .requestPasswordRecovery(email)
      .then(response => {
        this.loading = false
        this.responses.requestPasswordRecovery = response
        if (is.function(this.#on.requestPasswordRecovery.success)) this.#on.requestPasswordRecovery.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.requestPasswordRecovery = error
        if (is.function(this.#on.requestPasswordRecovery.error)) this.#on.requestPasswordRecovery.error(error)
      })
  }
  recover (token, remember) {
    this.loading = true
    this.#dependency
      .recover(token, remember)
      .then(response => {
        this.loading = false
        this.responses.recover = response
        this.user = this.#getCurrentUser()
        if (is.function(this.#on.recover.success)) this.#on.recover.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.recover = error
        if (is.function(this.#on.recover.error)) this.#on.recover.error(error)
      })
  }
  acceptInvite (token, password, remember) {
    this.loading = true
    this.#dependency
      .acceptInvite(token, password, remember)
      .then(response => {
        this.loading = false
        this.responses.acceptInvite = response
        this.user = this.#getCurrentUser()
        if (is.function(this.#on.acceptInvite.success)) this.#on.acceptInvite.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.acceptInvite = error
        if (is.function(this.#on.acceptInvite.error)) this.#on.acceptInvite.error(error)
      })
  }
  acceptInviteExternalProvider (provider, token) {
    this.loading = true
    this.#dependency
      .acceptInviteExternalProvider(provider, token)
      .then(response => {
        this.loading = false
        this.responses.acceptInviteExternalProvider = response
        this.user = this.#getCurrentUser()
        if (is.function(this.#on.acceptInviteExternalProvider.success)) this.#on.acceptInviteExternalProvider.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.acceptInviteExternalProvider = error
        if (is.function(this.#on.acceptInviteExternalProvider.error)) this.#on.acceptInviteExternalProvider.error(error)
      })
  }

  // User methods—does this belong in other component?
  update (userMetadata) {
    this.loading = true
    this.#dependency
      .update(this.user, userMetadata)
      .then(response => {
        this.loading = false
        this.responses.update = response
        this.user = this.#getCurrentUser()
        if (is.function(this.#on.update.success)) this.#on.update.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.update = error
        if (is.function(this.#on.update.error)) this.#on.update.error(error)
      })
  }
  getJwt () {
    this.loading = true
    this.#dependency
      .getJwt(this.user)
      .then(response => {
        this.loading = false
        this.responses.getJwt = response
        if (is.function(this.#on.getJwt.success)) this.#on.getJwt.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.getJwt = error
        if (is.function(this.#on.getJwt.error)) this.#on.getJwt.error(error)
      })
  }
  logout () {
    this.loading = true
    this.#dependency
      .logout(this.user)
      .then(response => {
        this.loading = false
        this.responses.logout = response
        this.user = this.#getCurrentUser()
        if (is.function(this.#on.logout.success)) this.#on.logout.success(response)
      })
      .catch(error => {
        this.loading = false
        this.responses.logout = error
        if (is.function(this.#on.logout.error)) this.#on.logout.error(error)
      })
  }
}

export default Identifiable
