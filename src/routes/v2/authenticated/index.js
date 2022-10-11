import { attachSiteHandler } from "@root/middleware"

const express = require("express")

const {
  NetlifyTomlService,
} = require("@services/configServices/NetlifyTomlService")

const { CollaboratorsRouter } = require("./collaborators")
const { NetlifyTomlRouter } = require("./netlifyToml")
const { SitesRouter } = require("./sites")
const { UsersRouter } = require("./users")

const getAuthenticatedSubrouter = ({
  authenticationMiddleware,
  sitesService,
  usersService,
  collaboratorsService,
  authorizationMiddleware,
  reviewRouter,
}) => {
  const netlifyTomlService = new NetlifyTomlService()

  const sitesV2Router = new SitesRouter({
    sitesService,
    authorizationMiddleware,
  })
  const collaboratorsRouter = new CollaboratorsRouter({
    collaboratorsService,
    authorizationMiddleware,
  })
  const usersRouter = new UsersRouter({ usersService })
  const netlifyTomlV2Router = new NetlifyTomlRouter({ netlifyTomlService })

  const authenticatedSubrouter = express.Router({ mergeParams: true })

  authenticatedSubrouter.use(authenticationMiddleware.verifyJwt)

  authenticatedSubrouter.use(
    "/sites/:siteName/collaborators",
    collaboratorsRouter.getRouter()
  )
  sitesV2Router.use(
    "/:siteName/review",
    attachSiteHandler,
    reviewRouter.getRouter()
  )
  authenticatedSubrouter.use("/sites", sitesV2Router.getRouter())
  authenticatedSubrouter.use("/user", usersRouter.getRouter())
  authenticatedSubrouter.use("/netlify-toml", netlifyTomlV2Router.getRouter())

  return authenticatedSubrouter
}

export default getAuthenticatedSubrouter
