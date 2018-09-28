'use strict'

/*
 * adonis-ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const GE = require('@adonisjs/generic-exceptions')
const One = require('./Schemes/OAuth')

/**
 * The public interface to authenticate and get user
 * info using one of the available drivers.
 *
 * @class Authenticator
 * @constructor
 */
class Authenticator {
  constructor (driverInstance, request, response) {
    this._driverInstance = driverInstance
    this._request = request
    this._response = response
  }

  /**
   * Add runtime scope to be used for redirecting the user.
   *
   * @param  {Array} scope
   *
   * @return {Object}
   */
  scope (scope) {
    if (!Array.isArray(scope)) {
      throw GE
        .InvalidArgumentException
        .invalidParameter('Value for scope must be an array', scope)
    }

    this._driverInstance.scope = scope
    return this
  }

  /**
   * Add runtime fields to be used for fetching the user profile
   *
   * @param  {Array} fields
   *
   * @return {Object}
   */
  fields (fields) {
    if (!Array.isArray(fields)) {
      throw GE
        .InvalidArgumentException
        .invalidParameter('Value for fields must be an array', fields)
    }

    this._driverInstance.fields = fields
    return this
  }

  /**
   * Returns the redirect uri using the driverInstance
   *
   * @method getRedirectUrl
   * @async
   *
   * @return {String}
   */
  async getRedirectUrl () {
    return this._driverInstance.getRedirectUrl()
  }

  /**
   * Redirects request to the provider website url.
   *
   * @method redirect
   * @async
   *
   * @return {void}
   */
  async redirect () {
    const url = await this.getRedirectUrl()
    this._response.status(302).redirect(url)
  }

  /**
   * Returns an instance AllyUser containing the user profile.
   * A driver is responsible for normalizing the user fields.
   *
   * @method getUser
   * @async
   *
   * @return {Object}
   */
  async getUser () {
    return this._driverInstance.getUser(this._request.get())
  }

  /**
   * Returns an instance AllyUser containing the user profile obtained from the given token.
   * A driver is responsible for normalizing the user fields.
   *
   * @method getUserByToken
   * @param string accessToken
   * @async
   *
   * @return {Object}
   */
  async getUserByToken (accessToken, accessSecret) {
    const isOAuthOne = this._driverInstance instanceof One

    if (isOAuthOne && !accessSecret) {
      throw GE
        .InvalidArgumentException
        .invalidParameter('Missing accessSecret as 2nd params, required by OAuth1 protocol')
    }

    if (isOAuthOne) {
      return this._driverInstance.getUserByToken(accessToken, accessSecret)
    }
    return this._driverInstance.getUserByToken(accessToken)
  }
}

module.exports = Authenticator
