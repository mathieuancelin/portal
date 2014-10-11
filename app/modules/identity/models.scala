package modules.identity

import modules.Env
import play.api.libs.Codecs
import play.api.libs.json._

import scala.concurrent.{Future, ExecutionContext}

case class Role(_id: String, name: String, description: String)

case class User(_id: String, name: String, surname: String, email: String, description: String, roles: Seq[String]) {
  def toJson = User.userFmt.writes(this)
  def toJsObject = User.userFmt.writes(this).as[JsObject]
  def toJsonString = Json.stringify(toJson)
  def isAdmin = roles.contains(Role.adminId)
  def actualRoles(implicit ec: ExecutionContext) = Future.sequence(roles.map(Env.roleStore.findById).map(_.collect { case Some(role) => role }))
}

object Role {
  implicit val roleFmt = Json.format[Role]
  lazy val adminId = play.api.Play.current.configuration.getString("portal.admin-id").getOrElse("ADMINISTRATOR")
  lazy val anonId = play.api.Play.current.configuration.getString("portal.anonymous-id").getOrElse("ANONYMOUS")
}

object User {
  private[this] val actualFormater = Json.format[User]
  private[this] val writerPlusHash = Json.writes[User].transform(jsv => jsv.as[JsObject] ++ Json.obj("email_hash" -> Codecs.md5((jsv \ "email").as[String].getBytes)))
  implicit val userFmt: Format[User] = new Format[User] {
    override def reads(json: JsValue): JsResult[User] = actualFormater.reads(json)
    override def writes(o: User): JsValue = writerPlusHash.writes(o)
  }
}

object AnonymousUser extends User("bHX9WbIcIrS68hD9az6yvSc6a", "John", "Doe", "john.doe@acme.com", "", Seq(Role.anonId))
