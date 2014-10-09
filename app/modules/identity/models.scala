package modules.identity

import play.api.libs.json.{JsObject, Json}

import scala.concurrent.{Future, ExecutionContext}

case class Role(id: String, name: String, description: String)

case class User(id: String, name: String, surname: String, email: String, description: String, roles: Seq[String]) {
  def toJson = User.userFmt.writes(this)
  def toJsObject = User.userFmt.writes(this).as[JsObject]
  def toJsonString = Json.stringify(toJson)
  def isAdmin = roles.contains(Role.adminId)
  def actualRoles(implicit ec: ExecutionContext) = Future.sequence(roles.map(RolesStore.role).map(_.collect { case Some(role) => role }))
}

object Role {
  implicit val roleFmt = Json.format[Role]
  lazy val adminId = play.api.Play.current.configuration.getString("portal.admin-id").getOrElse("ADMINISTRATOR")
  lazy val anonId = play.api.Play.current.configuration.getString("portal.anonymous-id").getOrElse("ANONYMOUS")
}

object User {
  implicit val userFmt = Json.format[User]
}

object AnonymousUser extends User("bHX9WbIcIrS68hD9az6yvSc6a", "John", "Doe", "john.doe@acme.com", "", Seq(Role.anonId))
