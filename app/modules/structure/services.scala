package modules.structure

import java.nio.charset.Charset
import java.util.concurrent.TimeUnit

import akka.actor.{Actor, Props}
import akka.util.Timeout
import com.google.common.io.Files
import modules.identity.User
import play.api.libs.concurrent.Akka
import play.api.libs.json.{Json, Reads, Writes}

import scala.concurrent.duration.Duration
import scala.concurrent.{ExecutionContext, Future}

trait MasheteStore {
  def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Mashete]]
  def findAll()(implicit ec: ExecutionContext): Future[Seq[Mashete]]
  def delete(id: String)(implicit ec: ExecutionContext): Future[Unit]
  def save(mashete: Mashete)(implicit ec: ExecutionContext):Future[Mashete]
}

package object mashetes {

  import akka.pattern.ask

  implicit lazy val timeout = Timeout(5, TimeUnit.SECONDS)

  trait MasheteStoreEvent
  case class Sync() extends MasheteStoreEvent
  case class SaveMashete(mashete: Mashete) extends MasheteStoreEvent
  case class DeleteMashete(id: String) extends MasheteStoreEvent
  case class FindAll() extends MasheteStoreEvent
  case class FindById(id: String) extends MasheteStoreEvent

  class MasheteStoreFileActor extends Actor {

    implicit val ec = context.dispatcher
    val utf8 = Charset.forName("UTF-8")
    val file = play.api.Play.current.getFile("conf/data/mashetes.json")
    val mashetesFromFile = Json.parse(Files.toString(file, utf8)).as(Reads.seq(Mashete.masheteFmt))

    var mashetes = Map[String, Mashete]()

    mashetes = mashetes ++ mashetesFromFile.map(u => (u.id, u))

    override def receive: Actor.Receive = {
      case SaveMashete(mashete) => {
        if (!mashetes.contains(mashete.id)) {
          mashetes = mashetes + ((mashete.id, mashete))
        }
        sender() ! mashete
      }
      case DeleteMashete(id) => {
        mashetes = mashetes - id
        sender() ! ()
      }
      case FindAll() => sender() ! mashetes.values.toSeq
      case FindById(id) => sender() ! mashetes.get(id)
      case Sync() => {
        Files.write(Json.stringify(Json.toJson(mashetes.values.toSeq)(Writes.seq(Mashete.masheteFmt))), file, utf8)
        context.system.scheduler.scheduleOnce(Duration(5, TimeUnit.SECONDS))(self ! Sync())
      }
      case _ =>
    }
  }

  object MasheteStoreFile extends MasheteStore {
    private[this] lazy val ref = Akka.system(play.api.Play.current).actorOf(Props[MasheteStoreFileActor])
    override def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Mashete]] = (ref ? FindById(id)).mapTo[Option[Mashete]]
    override def findAll()(implicit ec: ExecutionContext): Future[Seq[Mashete]] =               (ref ? FindAll()).mapTo[Seq[Mashete]]
    override def delete(id: String)(implicit ec: ExecutionContext): Future[Unit] =              (ref ? DeleteMashete(id)).mapTo[Unit]
    override def save(mashete: Mashete)(implicit ec: ExecutionContext): Future[Mashete] =       (ref ? SaveMashete(mashete)).mapTo[Mashete]
  }

  trait MasheteStoreSupport {
    val masheteStore: MasheteStore = MasheteStoreFile
  }
}

object PagesStore {

  lazy val pages: Seq[Page] = Json.parse(Files.toString(play.api.Play.current.getFile("conf/data/portal.json"), Charset.forName("UTF-8"))).as(Reads.seq(Page.pageFmt))

  def findByUrl(url: String)(implicit ec: ExecutionContext): Future[Option[Page]] = Future.successful(pages.find(p => p.url == url))

  def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Page]] = Future.successful(pages.find(p => p.id == id))

  def pages(user: User)(implicit ec: ExecutionContext): Future[Seq[Page]] = Future.successful(pages.filter(p => p.accessibleByIds.intersect(user.roles).size > 0))
  def pages(from: Page, user: User)(implicit ec: ExecutionContext): Future[Seq[Page]] = {
    Future.successful(pages.filter(p => p.url.startsWith(from.url)))
  }

  def directSubPages(user: User, from: Page)(implicit ec: ExecutionContext): Future[Seq[Page]] = {
    from.subPages.map(_.filter(_.accessibleByIds.intersect(user.roles).size > 0))
  }

  def subPages(user: User, from: String)(implicit ec: ExecutionContext): Future[Seq[Page]] = {
    findById(from).flatMap {
      case Some(page) => page.subPages.flatMap(c => Future.sequence(c.map(p => pages(p, user))).map(_.flatten))
      case _ => Future.successful(Seq())
    }
  }
}