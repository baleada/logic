/*
 * IdentifiableGoTrue.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import GoTrue from 'gotrue-js'

/* Utils */
import { emit } from '../util/functions'

/* Constants */
// https://github.com/netlify/gotrue-js#oauth-providers-supported-by-netlify
const oauthProvidersSupportedByNetlify = ['google', 'github', 'gitlab', 'bitbucket'],
      getDefaultEmitter = (promise) => {
        return (response, instance) => {
          instance.setUser()
          instance.setResponse(response, promise)
        }
      }

export default class IdentifiableGoTrue {
  constructor (options = {}) {
    /* Options */
    options = {
      externalProviders: {},
      onSignup: getDefaultEmitter('signup'),
      onLogin: getDefaultEmitter('login'),
      onConfirm: getDefaultEmitter('confirm'),
      onRequestPasswordRecovery: getDefaultEmitter('requestPasswordRecovery'),
      onRecover: getDefaultEmitter('recover'),
      onAcceptInvite: getDefaultEmitter('acceptInvite'),
      ...options
    }

    this._externalProviders = options._externalProviders
    // Other options initialized in for loop below

    /* Public properties */
    this.responses = {}
    this.token = ''

    /* Private properties */
    this._computedUser = {}
    this._computedUserData = {}
    this._computedJwt = ''
    this._on = {}
    this._computedStatus = {
      updating: {
        userData: false,
        jwt: false,
      },
      doing: {}
    }

    // Init options, responses, and on<Method>s
    const promises = [
      { name: 'signup', emitter: 'onSignup' },
      { name: 'login', emitter: 'onLogin' },
      { name: 'confirm', emitter: 'onConfirm' },
      { name: 'requestPasswordRecovery', emitter: 'onRequestPasswordRecovery' },
      { name: 'recover', emitter: 'onRecover' },
      { name: 'acceptInvite', emitter: 'onAcceptInvite' },
      { name: 'update', emitter: 'onUpdate' },
      { name: 'logout', emitter: 'onLogout' },
    ]
    promises.forEach(({ name, emitter }) => {
      options[emitter] = options[emitter] || ((response, instance) => instance.setResponse(response, name))
      this.responses[name] = {}
      this._on[name] = options[emitter]
      this._computedStatus.doing[name] = false
    })

    /* Dependency */
    this._goTrueOptions = this._getDependencyOptions(options)
    this._goTrue = new GoTrue(this._goTrueOptions)

    this.setUser()
  }

  _getDependencyOptions = ({
    onSignup,
    onLogin,
    onLoginExternalProvider,
    onConfirm,
    onRequestPasswordRecovery,
    onRecover,
    onAcceptInvite,
    onAcceptInviteExternalProvider,
    onUpdate,
    onLogout,
    ...rest
  }) => rest

  get user () {
    return this._computedUser
  }
  get userData () {
    return this._computedUserData
  }
  get jwt () {
    return this._computedJwt
  }
  get status () {
    return this._computedStatus
  }
  get loginExternalUrls () {
    return {
      ...this._getExternalUrls(this._getLoginExternalUrl.bind(this)),
      ...this._externalUrls.login,
    }
  }
  _getLoginExternalUrl (provider) {
    return this._goTrue.loginExternalUrl(provider)
  }
  get acceptInviteExternalUrls () {
    return {
      ...this._getExternalUrls(this._getAcceptInviteExternalUrl.bind(this)),
      ...this._externalUrls.acceptInvite,
    }
  }
  _getAcceptInviteExternalUrl (provider) {
    return this._goTrue.acceptInviteExternalUrl(provider, this.token)
  }
  _getExternalUrls (getter) {
    return oauthProvidersSupportedByNetlify.reduce(
      (defaultExternalUrls, provider) => ({ ...defaultExternalUrls, [provider]: getter(provider) }),
      {}
    )
  }

  async updateUserData () {
    try {
      this._computedStatus.updating.userData = true
      this._computedUserData = await this.user.getUserData()
      this._computedStatus.updating.userData = false
    } catch (error) {
      this._computedUserData = error
      this._computedStatus.updating.userData = false
    }

    return this
  }
  async updateJwt (forceRefresh) {
    try {
      this._computedStatus.updating.jwt = true
      this._computedJwt = await this.user.jwt(forceRefresh)
      this._computedStatus.updating.jwt = false
    } catch (error) {
      this._computedJwt = error
      this._computedStatus.updating.jwt = false
    }

    return this
  }

  setUser (user) {
    this._computedUser = user || this._goTrue.currentUser() || {}
    return this.updateUserData()
  }
  setResponses (responses) {
    this.responses = responses
    return this
  }
  setResponse (response, promise) {
    this.responses[promise] = response
    return this
  }
  setToken (token) {
    this.token = token
    return this
  }

  async signup (email, password, data) {
    this._computedStatus.doing.signup = true
    const response = await this._goTrue.signup(email, password, data)
    this._computedStatus.doing.signup = false
    emit(this._on.signup, response, this)
    return this
  }
  async login (email, password, remember) {
    this._computedStatus.doing.login = true
    const response = await this._goTrue.login(email, password, remember)
    this._computedStatus.doing.login = false
    emit(this._on.login, response, this)
    return this
  }
  async confirm (token, remember) {
    this._computedStatus.doing.confirm = true
    const response = await this._goTrue.confirm(token, remember)
    this._computedStatus.doing.confirm = false
    emit(this._on.confirm, response, this)
    return this
  }
  async requestPasswordRecovery (email) {
    this._computedStatus.doing.requestPasswordRecovery = true
    const response = await this._goTrue.requestPasswordRecovery(email)
    this._computedStatus.doing.requestPasswordRecovery = false
    emit(this._on.requestPasswordRecovery, response, this)
    return this
  }
  async recover (token, remember) {
    this._computedStatus.doing.recover = true
    const response = await this._goTrue.recover(token, remember)
    this._computedStatus.doing.recover = false
    emit(this._on.recover, response, this)
    return this
  }
  async acceptInvite (token, password, remember) {
    this._computedStatus.doing.acceptInvite = true
    const response = await this._goTrue.acceptInvite(token, password, remember)
    this._computedStatus.doing.acceptInvite = false
    emit(this._on.acceptInvite, response, this)
    return this
  }

  // User methods—does this belong in a different class?
  async update (data) {
    this._computedStatus.doing.update = true
    const response = await this.user.update(data)
    this._computedStatus.doing.update = false
    emit(this._on.update, response, this)
    return this
  }
  async logout () {
    this._computedStatus.doing.logout = true
    const response = await this.user.logout()
    this._computedStatus.doing.logout = false
    emit(this._on.logout, response, this)
    return this
  }
}
