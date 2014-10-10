package modules.structure

import java.nio.charset.Charset
import java.util.concurrent.TimeUnit

import akka.actor.{ActorRef, Actor, Props}
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

trait PageStore {
  def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Page]]
  def findAll()(implicit ec: ExecutionContext): Future[Seq[Page]]
  def delete(id: String)(implicit ec: ExecutionContext): Future[Unit]
  def save(page: Page)(implicit ec: ExecutionContext):Future[Page]
  def findByUrl(url: String)(implicit ec: ExecutionContext): Future[Option[Page]]
  def pages(user: User)(implicit ec: ExecutionContext): Future[Seq[Page]]
  def pages(from: Page, user: User)(implicit ec: ExecutionContext): Future[Seq[Page]]
  def directSubPages(user: User, from: Page)(implicit ec: ExecutionContext): Future[Seq[Page]]
  def subPages(user: User, from: String)(implicit ec: ExecutionContext): Future[Seq[Page]]
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
    val syncDuration = Duration(1, TimeUnit.MINUTES)
    val utf8 = Charset.forName("UTF-8")
    val file = play.api.Play.current.getFile("conf/data/mashetes.json")
    val mashetesFromFile = Json.parse(Files.toString(file, utf8)).as(Reads.seq(Mashete.masheteFmt))

    var mashetes = Map[String, Mashete]()

    mashetes = mashetes ++ mashetesFromFile.map(u => (u.id, u))

    override def preStart(): Unit = {
      context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
    }

    override def receive: Actor.Receive = {
      case SaveMashete(mashete) => {
        if (!mashetes.contains(mashete.id)) {
          mashetes = mashetes + ((mashete.id, mashete))
        }
        sender() ! mashete
      }
      case DeleteMashete(id) => {
        mashetes = mashetes - id
        sender() ! Unit
      }
      case FindAll() => sender() ! mashetes.values.toSeq
      case FindById(id) => sender() ! mashetes.get(id)
      case Sync() => {
        Files.write(Json.stringify(Json.toJson(mashetes.values.toSeq)(Writes.seq(Mashete.masheteFmt))), file, utf8)
        context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
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

package object pages {

  import akka.pattern.ask

  implicit lazy val timeout = Timeout(5, TimeUnit.SECONDS)

  trait PageStoreEvent
  case class Sync() extends PageStoreEvent
  case class SavePage(page: Page) extends PageStoreEvent
  case class DeletePage(id: String) extends PageStoreEvent
  case class FindAll() extends PageStoreEvent
  case class FindById(id: String) extends PageStoreEvent
  case class FindByUrl(url: String) extends PageStoreEvent
  case class PagesForUser(user: User) extends PageStoreEvent
  case class PagesForUserFrom(user: User, from: Page) extends PageStoreEvent
  case class DirectSubPages(user: User, from: Page) extends PageStoreEvent
  case class SubPages(user: User, from: String) extends PageStoreEvent

  class PageStoreFileActor extends Actor {

    implicit val ec = context.dispatcher
    val syncDuration = Duration(1, TimeUnit.MINUTES)
    val utf8 = Charset.forName("UTF-8")
    val file = play.api.Play.current.getFile("conf/data/portal.json")
    val pagesFromFile = Json.parse(Files.toString(file, utf8)).as(Reads.seq(Page.pageFmt))

    var pages = Map[String, Page]()

    pages = pages ++ pagesFromFile.map(u => (u.id, u))

    def pagesForUserFrom(ref: ActorRef, from: Page, user: User): Future[Seq[Page]] = (ref ? PagesForUserFrom(user, from)).mapTo[Seq[Page]]

    override def preStart(): Unit = {
      context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
    }

    override def receive: Actor.Receive = {
      case SavePage(page) => {
        if (!pages.contains(page.id)) {
          pages = pages + ((page.id, page))
        }
        sender() ! page
      }
      case DeletePage(id) => {
        pages = pages - id
        sender() ! Unit
      }
      case FindAll() => sender() ! pages.values.toSeq
      case FindById(id) => sender() ! pages.get(id)
      case FindByUrl(url) => sender() ! pages.values.find(p => p.url == url)
      case PagesForUser(user) => sender() ! pages.values.filter(p => p.accessibleByIds.intersect(user.roles).size > 0)
      case PagesForUserFrom(user, from) => sender() ! pages.values.filter(p => p.url.startsWith(from.url))
      case DirectSubPages(user, from) => {
        val senderr = sender()
        from.subPages.map(_.filter(_.accessibleByIds.intersect(user.roles).size > 0)).map { p =>
          senderr ! p
        }
      }
      case SubPages(user, from) => {
        val senderr = sender()
        val selff = self
        val fu = pages.get(from) match {
          case Some(page) => page.subPages.flatMap(c => Future.sequence(c.map(p => pagesForUserFrom(selff, p, user))).map(_.flatten))
          case _ => Future.successful(Seq())
        }
        fu.map { seq =>
          senderr ! seq
        }
      }
      case Sync() => {
        Files.write(Json.stringify(Json.toJson(pages.values.toSeq)(Writes.seq(Page.pageFmt))), file, utf8)
        context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
      }
      case _ =>
    }
  }

  object PageStoreFile extends PageStore {
    private[this] lazy val ref = Akka.system(play.api.Play.current).actorOf(Props[PageStoreFileActor])
    override def findByUrl(url: String)(implicit ec: ExecutionContext): Future[Option[Page]] =              (ref ? FindByUrl(url)).mapTo[Option[Page]]
    override def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Page]] =                (ref ? FindById(id)).mapTo[Option[Page]]
    override def pages(user: User)(implicit ec: ExecutionContext): Future[Seq[Page]] =                      (ref ? PagesForUser(user)).mapTo[Seq[Page]]
    override def pages(from: Page, user: User)(implicit ec: ExecutionContext): Future[Seq[Page]] =          (ref ? PagesForUserFrom(user, from)).mapTo[Seq[Page]]
    override def directSubPages(user: User, from: Page)(implicit ec: ExecutionContext): Future[Seq[Page]] = (ref ? DirectSubPages(user, from)).mapTo[Seq[Page]]
    override def subPages(user: User, from: String)(implicit ec: ExecutionContext): Future[Seq[Page]] =     (ref ? SubPages(user, from)).mapTo[Seq[Page]]
    override def findAll()(implicit ec: ExecutionContext): Future[Seq[Page]] =                              (ref ? FindAll()).mapTo[Seq[Page]]
    override def delete(id: String)(implicit ec: ExecutionContext): Future[Unit] =                          (ref ? DeletePage(id)).mapTo[Unit]
    override def save(page: Page)(implicit ec: ExecutionContext): Future[Page] =                            (ref ? SavePage(page)).mapTo[Page]
  }

  trait PageStoreSupport {
    val pageStore: PageStore = PageStoreFile
  }
}