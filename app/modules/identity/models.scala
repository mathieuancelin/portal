package modules.identity

import play.api.libs.json.{JsObject, Json}

case class Role(id: String, name: String, description: String)

case class User(id: String, name: String, surname: String, email: String, description: String, roles: Seq[Role]) {
  def toJson = User.userFmt.writes(this)
  def toJsObject = User.userFmt.writes(this).as[JsObject]
  def toJsonString = Json.stringify(toJson)
  def isAdmin = roles.contains(Admin)
}

object Role {
  implicit val roleFmt = Json.format[Role]
}

object User {
  implicit val userFmt = Json.format[User]
}

// For POC purpose only

object Anonymous extends Role("0", "ANONYMOUS", "An anonymous user")
object Admin extends Role("1", "ADMINISTRATOR", "An administrator")
object Writer extends Role("2", "WRITER", "A person that can manage content")

object AnonymousUser extends User("0", "John", "Doe", "john.doe@acme.com", "", Seq(Anonymous))
object MathieuUser extends User("1", "Mathieu", "Ancelin", "mathieu.ancelin@acme.com", "", Seq(Admin, Writer))