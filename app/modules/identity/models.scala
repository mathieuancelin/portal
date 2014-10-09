package modules.identity

import play.api.libs.json.{JsObject, Json}

case class Role(id: String, name: String, description: String)

case class User(id: String, name: String, surname: String, email: String, description: String, roles: Seq[String]) {
  def toJson = User.userFmt.writes(this)
  def toJsObject = User.userFmt.writes(this).as[JsObject]
  def toJsonString = Json.stringify(toJson)
  def isAdmin = roles.contains("ADMINISTRATOR")
  def actualRoles = roles.map(RolesStore.role).collect { case Some(role) => role }
}

object Role {
  implicit val roleFmt = Json.format[Role]
}

object User {
  implicit val userFmt = Json.format[User]
}

object AnonymousUser extends User("bHX9WbIcIrS68hD9az6yvSc6ajiWVlHEiOrH6VD9tZbT5lmucOLOJAdneDS3eAfi",
  "John", "Doe", "john.doe@acme.com", "", Seq("ANONYMOUS"))
