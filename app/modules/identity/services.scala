package modules.identity

import java.nio.charset.Charset

import com.google.common.io.Files
import play.api.libs.json.{Json, Reads}

object UsersStore {

  private[this] lazy val users = Json.parse(Files.toString(play.api.Play.current.getFile("conf/data/users.json"), Charset.forName("UTF-8"))).as(Reads.seq(User.userFmt))

  def user(email: String): Option[User] = users.find(_.email == email)

}

object RolesStore {

  private[this] lazy val roles = Json.parse(Files.toString(play.api.Play.current.getFile("conf/data/roles.json"), Charset.forName("UTF-8"))).as(Reads.seq(Role.roleFmt))

  def role(id: String): Option[Role] = roles.find(_.id == id)
}