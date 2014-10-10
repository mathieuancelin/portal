package modules

import modules.identity.roles.RoleStoreSupport
import modules.identity.users.UserStoreSupport
import modules.structure.mashetes.MasheteStoreSupport

object Env extends UserStoreSupport with RoleStoreSupport with MasheteStoreSupport {

}
