/*
 * IdentifiableGoTrue.js
 * (c) 2019-present Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */
import GoTrue from 'gotrue-js'

/* Utils */
import emit from '../util/emit'

/* Constants */
// https://github.com/netlify/gotrue-js#oauth-providers-supported-by-netlify
const oauthProvidersSupportedByNetlify = ['google', 'github', 'gitlab', 'bitbucket']

export default class IdentifiableGoTrue {
  constructor (options = {}) {
    /* Options */
    options = {
      externalProviders: {},
      onSignup: (response, instance) => {
        instance.setUser()
        instance.setResponse(response, 'signup')
      },
      onLogin: (response, instance) => {
        instance.setUser()
        instance.setResponse(response, 'login')
      },
      onConfirm: (response, instance) => {
        instance.setUser()
        instance.setResponse(response, 'confirm')
      },
      onRequestPasswordRecovery: (response, instance) => {
        instance.setUser()
        instance.setResponse(response, 'requestPasswordRecovery')
      },
      onRecover: (response, instance) => {
        instance.setUser()
        instance.setResponse(response, 'recover')
      },
      onAcceptInvite: (response, instance) => {
        instance.setUser()
        instance.setResponse(response, 'acceptInvite')
      },
      ...options
    }

    this._onGetUserData = options.onGetUserData
    this._externalProviders = options._externalProviders
    // Other options initialized in for loop below

    /* Public properties */
    this.responses = {}
    this.token = ''

    /* Private properties */
    this._computedUser = {}
    this._on = {}
    this._computedStatus = {
      gettingUser: false
    }

    // Init options, responses, and on<Method>s
    const promises = [
      { name: 'signup', capitalized: 'Signup' },
      { name: 'login', capitalized: 'Login' },
      { name: 'loginExternalProvider', capitalized: 'LoginExternalProvider' },
      { name: 'confirm', capitalized: 'Confirm' },
      { name: 'requestPasswordRecovery', capitalized: 'RequestPasswordRecovery' },
      { name: 'recover', capitalized: 'Recover' },
      { name: 'acceptInvite', capitalized: 'AcceptInvite' },
      { name: 'acceptInviteExternalProvider', capitalized: 'AcceptInviteExternalProvider' },
      { name: 'update', capitalized: 'Update' },
      { name: 'getJwt', capitalized: 'GetJwt' },
      { name: 'logout', capitalized: 'Logout' },
    ]
    promises.forEach(({ name, capitalized }) => {
      options[`on${capitalized}`] = options[`on${capitalized}`] || ((response, instance) => instance.setResponse(response, name))
      this.responses[name] = {}
      this._on[name] = options[`on${capitalized}`]
      this._computedStatus[`doing${capitalized}`] = false
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
    onGetJwt,
    onLogout,
    ...rest,
  }) => rest

  get user () {
    return this._computedUser
  }
  get userData () {
    return this.user.getUserData()
      .then(this._onGetUserData)
      .catch(this._onGetUserData)
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

  setUser (user) {
    this._computedUser = user || this._goTrue.currentUser() || {}
    return this
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
    this._computedStatus.doingSignup = true
    const response = await this._goTrue.signup(email, password, data)
    this._computedStatus.doingSignup = false
    emit(this._on.signup, response, this)
    return this
  }
  async login (email, password, remember) {
    this._computedStatus.doingLogin = true
    const response = await this._goTrue.login(email, password, remember)
    this._computedStatus.doingLogin = false
    emit(this._on.login, response, this)
    return this
  }
  async confirm (token, remember) {
    this._computedStatus.doingConfirm = true
    const response = await this._goTrue.confirm(token, remember)
    this._computedStatus.doingConfirm = false
    emit(this._on.confirm, response, this)
    return this
  }
  async requestPasswordRecovery (email) {
    this._computedStatus.doingRequestPasswordRecovery = true
    const response = await this._goTrue.requestPasswordRecovery(email)
    this._computedStatus.doingRequestPasswordRecovery = false
    emit(this._on.requestPasswordRecovery, response, this)
    return this
  }
  async recover (token, remember) {
    this._computedStatus.doingRecover = true
    const response = await this._goTrue.recover(token, remember)
    this._computedStatus.doingRecover = false
    emit(this._on.recover, response, this)
    return this
  }
  async acceptInvite (token, password, remember) {
    this._computedStatus.doingAcceptInvite = true
    const response = await this._goTrue.acceptInvite(token, password, remember)
    this._computedStatus.doingAcceptInvite = false
    emit(this._on.acceptInvite, response, this)
    return this
  }

  // User methods—does this belong in a different class?
  async update (userMetadata) {
    this._computedStatus.doingUpdate = true
    const response = await this.user.update(userMetadata)
    this._computedStatus.doingUpdate = false
    emit(this._on.update, response, this)
    return this
  }
  async getJwt () {
    this._computedStatus.doingGetJwt = true
    const response = await this.user.getJwt()
    this._computedStatus.doingGetJwt = false
    emit(this._on.getJwt, response, this)
    return this
  }
  async logout () {
    this._computedStatus.doingLogout = true
    const response = await this.user.logout()
    this._computedStatus.doingLogout = false
    emit(this._on.logout, response, this)
    return this
  }
}
