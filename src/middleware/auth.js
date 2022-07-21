import SessionData from "@root/classes/SessionData"

const autoBind = require("auto-bind")

class AuthMiddleware {
  constructor({ authMiddlewareService }) {
    this.authMiddlewareService = authMiddlewareService
    // We need to bind all methods because we don't invoke them from the class directly
    autoBind(this)
  }

  verifyJwt(req, res, next) {
    const { cookies, originalUrl: url } = req
    const {
      accessToken,
      githubId,
      isomerUserId,
      email,
    } = this.authMiddlewareService.verifyJwt({
      cookies,
      url,
    })
    const userSessionData = new SessionData({
      accessToken,
      githubId,
      isomerUserId,
      email,
    })
    res.locals.sessionData = userSessionData
    return next()
  }

  whoamiAuth(req, res, next) {
    const { cookies, originalUrl: url } = req
    const {
      accessToken,
      githubId,
      isomerUserId,
      email,
    } = this.authMiddlewareService.whoamiAuth({
      cookies,
      url,
    })
    const userSessionData = new SessionData({
      accessToken,
      githubId,
      isomerUserId,
      email,
    })
    res.locals.sessionData = userSessionData
    return next()
  }

  // Replace access token with site access token if it is available
  async useSiteAccessTokenIfAvailable(req, res, next) {
    const {
      params: { siteName },
    } = req
    const { userId, accessToken: userAccessToken } = res.locals

    const siteAccessToken = await this.authMiddlewareService.retrieveSiteAccessTokenIfAvailable(
      { siteName, userAccessToken, userId }
    )

    if (siteAccessToken) res.locals.accessToken = siteAccessToken

    return next()
  }
}

export { AuthMiddleware }