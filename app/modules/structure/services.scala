package modules.structure

import java.nio.charset.Charset
import java.util.concurrent.TimeUnit

import akka.actor.{Actor, ActorRef, Props}
import akka.util.Timeout
import com.google.common.io.Files
import modules.Env
import modules.data.GenericElasticSearchCollection
import modules.identity.User
import play.api.libs.Codecs
import play.api.libs.concurrent.Akka
import play.api.libs.json._
import play.modules.reactivemongo.ReactiveMongoPlugin
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.bson.BSONObjectID

import scala.concurrent.duration.Duration
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}
import play.api.Play.current
import play.modules.reactivemongo.json.BSONFormats._

trait MasheteStore {
  def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Mashete]]
  def findAll()(implicit ec: ExecutionContext): Future[Seq[Mashete]]
  def delete(id: String)(implicit ec: ExecutionContext): Future[Unit]
  def deleteAll()(implicit ec: ExecutionContext): Future[Unit]
  def save(mashete: Mashete)(implicit ec: ExecutionContext):Future[Mashete]
}

trait PageStore {
  def deleteAll()(implicit ec: ExecutionContext): Future[Unit]
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

  import akka.pattern.{ask, pipe}

  implicit lazy val timeout = Timeout(5, TimeUnit.SECONDS)

  trait MasheteStoreEvent
  case class Sync() extends MasheteStoreEvent
  case class SaveMashete(mashete: Mashete) extends MasheteStoreEvent
  case class DeleteMashete(id: String) extends MasheteStoreEvent
  case class FindAll() extends MasheteStoreEvent
  case class FindById(id: String) extends MasheteStoreEvent

  class FileBackedMasheteStoreActor extends Actor {

    implicit val ec = context.dispatcher
    val syncDuration = Duration(1, TimeUnit.MINUTES)
    val utf8 = Charset.forName("UTF-8")
    val file = play.api.Play.current.getFile("conf/data/mashetes.json")
    if (!file.exists()) {
      file.createNewFile()
    }
    val mashetesFromFile = Json.parse(Files.toString(file, utf8)).as(Reads.seq(Mashete.masheteFmt))

    var mashetes = Map[String, Mashete]()

    var hash = ""

    mashetes = mashetes ++ mashetesFromFile.map(u => (u._id, u))

    override def preStart(): Unit = {
      context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
    }

    override def receive: Actor.Receive = {
      case SaveMashete(mashete) => {
        if (!mashetes.contains(mashete._id)) {
          mashetes = mashetes + ((mashete._id, mashete))
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
        val str = Json.stringify(Json.toJson(mashetes.values.toSeq)(Writes.seq(Mashete.masheteFmt)))
        val hashVal = Codecs.md5(str.getBytes(utf8))
        if (hash != hashVal) {
          hash = hashVal
          if (!file.exists()) {
            file.createNewFile()
          }
          Files.write(str, file, utf8)
        }
        context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
      }
      case _ =>
    }
  }

  class ElasticsearchBackedMasheteStoreActor extends Actor {

    implicit val ec = context.dispatcher
    val collection = new GenericElasticSearchCollection[Mashete]("mashete")(Mashete.masheteFmt)

    override def receive: Actor.Receive = {
      case SaveMashete(mashete) => {
        val senderrr = sender()
        collection.get(mashete._id).map {
          case Some(_) =>  collection.update(mashete._id, mashete).andThen {
            case Success(_) => senderrr ! mashete
            case Failure(e) => e.printStackTrace()
          }
          case None => collection.insert(mashete).andThen {
            case Success(_) => senderrr ! mashete
            case Failure(e) => e.printStackTrace()
          }
        }
      }
      case DeleteMashete(id) => collection.delete(id) pipeTo sender()
      case FindAll() => collection.findAll().map(_.toSeq.map(_._1)) pipeTo sender()
      case FindById(id) => collection.get(id).map(_.map(_._1)) pipeTo sender()
      case _ =>
    }
  }

  //object AsyncMasheteStore extends MasheteStore {
  //  private[this] lazy val ref = if (Env.fileBacked)
  //    Akka.system(play.api.Play.current).actorOf(Props[FileBackedMasheteStoreActor])
  //  else
  //    Akka.system(play.api.Play.current).actorOf(Props[ElasticsearchBackedMasheteStoreActor])
  //  override def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Mashete]] = (ref ? FindById(id)).mapTo[Option[Mashete]]
  //  override def findAll()(implicit ec: ExecutionContext): Future[Seq[Mashete]] =               (ref ? FindAll()).mapTo[Seq[Mashete]]
  //  override def delete(id: String)(implicit ec: ExecutionContext): Future[Unit] =              (ref ? DeleteMashete(id)).mapTo[Unit]
  //  override def save(mashete: Mashete)(implicit ec: ExecutionContext): Future[Mashete] =       (ref ? SaveMashete(mashete)).mapTo[Mashete]
  //  override def deleteAll()(implicit ec: ExecutionContext): Future[Unit] = Future.successful(())
  //}

  object MongoMasheteStore extends MasheteStore {

    lazy val collection = ReactiveMongoPlugin.db.collection[JSONCollection]("mashete")

    override def deleteAll()(implicit ec: ExecutionContext): Future[Unit] = collection.remove(Json.obj()).map(_ => ())
    override def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Mashete]] = collection.find(Json.obj("_id" -> id)).cursor[JsObject].headOption.map(_.map( js => js.as[Mashete]))
    override def findAll()(implicit ec: ExecutionContext): Future[Seq[Mashete]] = collection.find(Json.obj()).cursor[JsObject].collect[Seq]().map(_.map(_.as[Mashete]))
    override def delete(id: String)(implicit ec: ExecutionContext): Future[Unit] = collection.remove(Json.obj("_id" -> id)).map(_ => ())
    override def save(mashete: Mashete)(implicit ec: ExecutionContext): Future[Mashete] = {
      findById(mashete._id).flatMap {
        case Some(m) => {
          collection.update(
            Json.obj("_id" -> mashete._id),
            Json.obj("$set" -> Mashete.masheteFmt.writes(mashete).as[JsObject].-("_id"))
          ).map{ _ => mashete }
        }
        case None => {
          val id = BSONObjectID.generate.stringify
          val obj = Mashete.masheteFmt.writes(mashete).as[JsObject]
          obj \ "_id" match {
            case _: JsUndefined => collection.insert(obj ++ Json.obj("_id" -> id)).map { _ => mashete }
            case JsObject(Seq((_, JsString(oid)))) => collection.insert(obj).map{ _ => mashete }
            case JsString(oid) => collection.insert(obj).map{ _ => mashete }
            case f => sys.error(s"Could not parse _id field: $f")
          }
        }
      }
    }
  }

  trait MasheteStoreSupport {
    val masheteStore: MasheteStore = MongoMasheteStore
  }
}

package object pages {

  import akka.pattern.{ask, pipe}

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

  class FileBackedPageStoreActor extends Actor {

    implicit val ec = context.dispatcher
    val syncDuration = Duration(1, TimeUnit.MINUTES)
    val utf8 = Charset.forName("UTF-8")
    val file = play.api.Play.current.getFile("conf/data/portal.json")
    if (!file.exists()) {
      file.createNewFile()
    }
    val pagesFromFile = Json.parse(Files.toString(file, utf8)).as(Reads.seq(Page.pageFmt))
    var hash = ""
    var pages = Map[String, Page]()

    pages = pages ++ pagesFromFile.map(u => (u._id, u))

    override def preStart(): Unit = {
      context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
    }

    override def receive: Actor.Receive = {
      case SavePage(page) => {
        if (!pages.contains(page._id)) {
          pages = pages + ((page._id, page))
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
        pages.get(from) match {
          case Some(page) => senderr ! pages.values.filter(p => p.url != page.url && p.url.startsWith(page.url))
          case _ => senderr ! Seq[Page]()
        }
      }
      case Sync() => {
        val str = Json.stringify(Json.toJson(pages.values.toSeq)(Writes.seq(Page.pageFmt)))
        val hashVal = Codecs.md5(str.getBytes(utf8))
        if (hash != hashVal) {
          hash = hashVal
          if (!file.exists()) {
            file.createNewFile()
          }
          Files.write(str, file, utf8)
        }
        context.system.scheduler.scheduleOnce(syncDuration)(self ! Sync())
      }
      case _ =>
    }
  }

  class ElasticsearchBackedPageStoreActor extends Actor {

    implicit val ec = context.dispatcher
    val collection = new GenericElasticSearchCollection[Page]("page")(Page.pageFmt)

    def pagesForUserFrom(ref: ActorRef, from: Page, user: User): Future[Seq[Page]] = (ref ? PagesForUserFrom(user, from)).mapTo[Seq[Page]]

    override def receive: Actor.Receive = {
      case SavePage(page) => {
        val senderrr = sender()
        collection.get(page._id).map {
          case Some(_) =>  collection.update(page._id, page).andThen {
            case Success(_) => senderrr ! page
            case Failure(e) => e.printStackTrace()
          }
          case None => collection.insert(page).andThen {
            case Success(_) => senderrr ! page
            case Failure(e) => e.printStackTrace()
          }
        }
      }
      case DeletePage(id) => collection.delete(id) pipeTo sender()
      case FindAll() => collection.findAll().map(_.toSeq.map(_._1)) pipeTo sender()
      case FindById(id) => collection.get(id).map(_.map(_._1)) pipeTo sender()
      case FindByUrl(url) => collection.findOne(Json.obj("query" -> Json.obj("term" -> Json.obj("url_hash" -> Codecs.md5(url.getBytes))))).map(_.map(_._1)) pipeTo sender() //collection.findAll().map(_.toSeq.map(_._1).find(_.url == url)) pipeTo sender()
      case PagesForUser(user) => {
        val senderrr = sender()
        collection.findAll() map { pages =>
          senderrr ! pages.toSeq.map(_._1).filter(p => p.accessibleByIds.intersect(user.roles).size > 0)
        }
      }
      case PagesForUserFrom(user, from) => {
        val senderrr = sender()
        collection.findAll() map { pages =>
          senderrr ! pages.toSeq.map(_._1).filter(p => p.url.startsWith(from.url))
        }
      }
      case DirectSubPages(user, from) => {
        val senderr = sender()
        from.subPages.map(_.filter(_.accessibleByIds.intersect(user.roles).size > 0)).map { p =>
          senderr ! p
        }
      }
      case SubPages(user, from) => {
        val senderr = sender()
        collection.findAll().map { pages =>
          collection.get(from).map {
            case Some(page) => senderr ! pages.toSeq.map(_._1).filter(p => p.url != page._1.url && p.url.startsWith(page._1.url))
            case _ => senderr ! Seq[Page]()
          }
        }
      }
      case _ =>
    }
  }

  //object AsyncPageStore extends PageStore {
  //  private[this] lazy val ref = if (Env.fileBacked)
  //    Akka.system(play.api.Play.current).actorOf(Props[FileBackedPageStoreActor])
  //  else
  //    Akka.system(play.api.Play.current).actorOf(Props[ElasticsearchBackedPageStoreActor])
  //
  //  override def findByUrl(url: String)(implicit ec: ExecutionContext): Future[Option[Page]] =              (ref ? FindByUrl(url)).mapTo[Option[Page]]
  //  override def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Page]] =                (ref ? FindById(id)).mapTo[Option[Page]]
  //  override def pages(user: User)(implicit ec: ExecutionContext): Future[Seq[Page]] =                      (ref ? PagesForUser(user)).mapTo[Seq[Page]]
  //  override def pages(from: Page, user: User)(implicit ec: ExecutionContext): Future[Seq[Page]] =          (ref ? PagesForUserFrom(user, from)).mapTo[Seq[Page]]
  //  override def directSubPages(user: User, from: Page)(implicit ec: ExecutionContext): Future[Seq[Page]] = (ref ? DirectSubPages(user, from)).mapTo[Seq[Page]]
  //  override def subPages(user: User, from: String)(implicit ec: ExecutionContext): Future[Seq[Page]] =     (ref ? SubPages(user, from)).mapTo[Seq[Page]]
  //  override def findAll()(implicit ec: ExecutionContext): Future[Seq[Page]] =                              (ref ? FindAll()).mapTo[Seq[Page]]
  //  override def delete(id: String)(implicit ec: ExecutionContext): Future[Unit] =                          (ref ? DeletePage(id)).mapTo[Unit]
  //  override def save(page: Page)(implicit ec: ExecutionContext): Future[Page] =                            (ref ? SavePage(page)).mapTo[Page]
  //  override def deleteAll()(implicit ec: ExecutionContext): Future[Unit] = Future.successful(())
  //}

  object MongoPageStore extends PageStore {

    lazy val collection = ReactiveMongoPlugin.db.collection[JSONCollection]("page")

    override def deleteAll()(implicit ec: ExecutionContext): Future[Unit] = collection.remove(Json.obj()).map(_ => ())
    override def findByUrl(url: String)(implicit ec: ExecutionContext): Future[Option[Page]] = collection.find(Json.obj("url" -> url)).cursor[JsObject].headOption.map(_.map( js => js.as[Page]))
    override def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Page]] = collection.find(Json.obj("_id" -> id)).cursor[JsObject].headOption.map(_.map( js => js.as[Page]))
    override def findAll()(implicit ec: ExecutionContext): Future[Seq[Page]] = collection.find(Json.obj()).cursor[JsObject].collect[Seq]().map(_.map(_.as[Page]))
    override def delete(id: String)(implicit ec: ExecutionContext): Future[Unit] = collection.remove(Json.obj("_id" -> id)).map(_ => ())
    override def save(page: Page)(implicit ec: ExecutionContext): Future[Page] = {
      findById(page._id).flatMap {
        case Some(m) => {
          collection.update(
            Json.obj("_id" -> page._id),
            Json.obj("$set" -> Page.pageFmt.writes(page).as[JsObject].-("_id"))
          ).map { _ => page }
        }
        case None => {
          val id = BSONObjectID.generate.stringify
          val obj = Page.pageFmt.writes(page).as[JsObject]
          obj \ "_id" match {
            case _: JsUndefined => collection.insert(obj ++ Json.obj("_id" -> id)).map { _ => page }
            case JsObject(Seq((_, JsString(oid)))) => collection.insert(obj).map { _ => page }
            case JsString(oid) => collection.insert(obj).map { _ => page }
            case f => sys.error(s"Could not parse _id field: $f")
          }
        }
      }
    }

    override def directSubPages(user: User, from: Page)(implicit ec: ExecutionContext): Future[Seq[Page]] = {
      from.subPages.map(_.filter(_.accessibleByIds.intersect(user.roles).size > 0))
    }

    override def subPages(user: User, from: String)(implicit ec: ExecutionContext): Future[Seq[Page]] = {
      findById(from).flatMap {
        case Some(page) => {
          findAll().map(pages => pages.filter(p => p.url != page.url && p.url.startsWith(page.url)))
        }
        case None => Future.failed(new RuntimeException(s"Page not fourn $from"))
      }
    }

    override def pages(user: User)(implicit ec: ExecutionContext): Future[Seq[Page]] = findAll().map(pages => pages.filter(p => p.accessibleByIds.intersect(user.roles).size > 0))

    override def pages(from: Page, user: User)(implicit ec: ExecutionContext): Future[Seq[Page]] = pages(user).map(pages => pages.filter(p => p.url.startsWith(from.url)))
  }



  trait PageStoreSupport {
    val pageStore: PageStore = MongoPageStore
  }
}