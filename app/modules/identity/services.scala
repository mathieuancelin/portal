package modules.identity

import java.nio.charset.Charset
import java.util.concurrent.TimeUnit

import akka.actor.{Actor, Props}
import akka.util.Timeout
import com.google.common.io.Files
import play.api.libs.concurrent.Akka
import play.api.libs.json.{Writes, Json, Reads}

import scala.concurrent.duration.Duration
import scala.concurrent.{ExecutionContext, Future}

trait UserStore {
  def findByEmail(email: String)(implicit ec: ExecutionContext): Future[Option[User]]
  def findById(id: String)(implicit ec: ExecutionContext): Future[Option[User]]
  def findAll()(implicit ec: ExecutionContext): Future[Seq[User]]
  def delete(id: String)(implicit ec: ExecutionContext): Future[Unit]
  def save(user: User)(implicit ec: ExecutionContext):Future[User]
}

trait RoleStore {
  def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Role]]
  def findAll()(implicit ec: ExecutionContext): Future[Seq[Role]]
  def delete(id: String)(implicit ec: ExecutionContext): Future[Unit]
  def save(role: Role)(implicit ec: ExecutionContext):Future[Role]
}

package object users {

  import akka.pattern.ask

  implicit lazy val timeout = Timeout(5, TimeUnit.SECONDS)

  trait UserStoreEvent
  case class Sync() extends UserStoreEvent
  case class SaveUser(user: User) extends UserStoreEvent
  case class DeleteUser(id: String) extends UserStoreEvent
  case class FindAll() extends UserStoreEvent
  case class FindById(id: String) extends UserStoreEvent
  case class FindByEmail(email: String) extends UserStoreEvent

  class UserStoreFileActor extends Actor {

    implicit val ec = context.dispatcher
    val syncDuration = Duration(1, TimeUnit.MINUTES)
    val utf8 = Charset.forName("UTF-8")
    val file = play.api.Play.current.getFile("conf/data/users.json")
    val usersFromFile = Json.parse(Files.toString(file, utf8)).as(Reads.seq(User.userFmt))

    var users = Map[String, User]()
    users = users ++ usersFromFile.map(u => (u.id, u))

    override def preStart(): Unit = {
      context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
    }

    override def receive: Receive = {
      case SaveUser(user) => {
        if (!users.contains(user.id)) {
          users = users + ((user.id, user))
        }
        sender() ! user
      }
      case DeleteUser(id) => {
        users = users - id
        sender() ! Unit
      }
      case FindAll() => sender() ! users.values.toSeq
      case FindById(id) => sender() ! users.get(id)
      case FindByEmail(email) => sender() ! users.values.find(_.email == email)
      case Sync() => {
        Files.write(Json.stringify(Json.toJson(users.values.toSeq)(Writes.seq(User.userFmt))), file, utf8)
        context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
      }
      case _ =>
    }
  }

  object UserStoreFile extends UserStore {
    private[this] lazy val ref = Akka.system(play.api.Play.current).actorOf(Props[UserStoreFileActor])
    override def findByEmail(email: String)(implicit ec: ExecutionContext): Future[Option[User]] = (ref ? FindByEmail(email)).mapTo[Option[User]]
    override def findById(id: String)(implicit ec: ExecutionContext): Future[Option[User]] = (ref ? FindById(id)).mapTo[Option[User]]
    override def findAll()(implicit ec: ExecutionContext): Future[Seq[User]] = (ref ? FindAll()).mapTo[Seq[User]]
    override def delete(id: String)(implicit ec: ExecutionContext): Future[Unit] = (ref ? DeleteUser(id)).mapTo[Unit]
    override def save(user: User)(implicit ec: ExecutionContext): Future[User] = (ref ? SaveUser(user)).mapTo[User]
  }

  trait UserStoreSupport {
    val userStore: UserStore = UserStoreFile
  }
}

package object roles {

  import akka.pattern.ask

  implicit lazy val timeout = Timeout(5, TimeUnit.SECONDS)

  trait RoleStoreEvent
  case class Sync() extends RoleStoreEvent
  case class SaveRole(role: Role) extends RoleStoreEvent
  case class DeleteRole(id: String) extends RoleStoreEvent
  case class FindAll() extends RoleStoreEvent
  case class FindById(id: String) extends RoleStoreEvent

  class RoleStoreFileActor extends Actor {

    implicit val ec = context.dispatcher
    val syncDuration = Duration(1, TimeUnit.MINUTES)
    val utf8 = Charset.forName("UTF-8")
    val file = play.api.Play.current.getFile("conf/data/roles.json")
    val rolesFromFile = Json.parse(Files.toString(file, utf8)).as(Reads.seq(Role.roleFmt))

    var roles = Map[String, Role]()
    roles = roles ++ rolesFromFile.map(u => (u.id, u))

    override def preStart(): Unit = {
      context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
    }

    override def receive: Actor.Receive = {
      case SaveRole(role) => {
        if (!roles.contains(role.id)) {
          roles = roles + ((role.id, role))
        }
        sender() ! role
      }
      case DeleteRole(id) => {
        roles = roles - id
        sender() ! Unit
      }
      case FindAll() => sender() ! roles.values.toSeq
      case FindById(id) => sender() ! roles.get(id)
      case Sync() => {
        Files.write(Json.stringify(Json.toJson(roles.values.toSeq)(Writes.seq(Role.roleFmt))), file, utf8)
        context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
      }
      case _ =>
    }
  }

  object RoleStoreFile extends RoleStore {
    private[this] lazy val ref = Akka.system(play.api.Play.current).actorOf(Props[RoleStoreFileActor])
    override def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Role]] = (ref ? FindById(id)).mapTo[Option[Role]]
    override def findAll()(implicit ec: ExecutionContext): Future[Seq[Role]] =               (ref ? FindAll()).mapTo[Seq[Role]]
    override def delete(id: String)(implicit ec: ExecutionContext): Future[Unit] =           (ref ? DeleteRole(id)).mapTo[Unit]
    override def save(role: Role)(implicit ec: ExecutionContext): Future[Role] =             (ref ? SaveRole(role)).mapTo[Role]
  }

  trait RoleStoreSupport {
    val roleStore: RoleStore = RoleStoreFile
  }
}
