package modules

import modules.identity.roles.RoleStoreSupport
import modules.identity.users.UserStoreSupport
import modules.structure.mashetes.MasheteStoreSupport
import modules.structure.pages.PageStoreSupport

object Env extends UserStoreSupport with RoleStoreSupport with MasheteStoreSupport with PageStoreSupport {

  lazy val fileBacked = play.api.Play.current.configuration.getBoolean("portal.file-backed").getOrElse(true)
}
