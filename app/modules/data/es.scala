package modules.data

import java.util.concurrent.TimeUnit

import akka.actor.Actor
import akka.util.Timeout
import common.IdGenerator
import play.api.libs.concurrent.Akka
import play.api.libs.json._
import play.api.libs.ws._

import play.api.Play.current

import scala.concurrent.{ExecutionContext, Future}

case class OpResult(ok: Boolean, msg: Option[String], document: Option[JsValue], updated: Int) {
  def isSuccess = ok
  def isFailure = !ok
  def getMessage = msg.getOrElse("No message !!!")
  def getMessage(mess: String) = msg.getOrElse(mess)
}

trait GenericCollection[T, Id, Error] {
  def insert(t: T)(implicit ctx: ExecutionContext): Future[(Id, Error)]

  def delete(id: Id)(implicit ctx: ExecutionContext): Future[Error]

  def update(id: Id, t: T)(implicit ctx: ExecutionContext): Future[Error]

  def get(id: Id)(implicit ctx: ExecutionContext): Future[Option[(T, Id)]]

  def findAll()(implicit ctx: ExecutionContext): Future[Traversable[(T, Id)]] = find(Json.obj())(ctx)

  def find(sel: JsObject)(implicit ctx: ExecutionContext): Future[Traversable[(T, Id)]]

  def findOne(sel: JsObject)(implicit ctx: ExecutionContext): Future[Option[(T, Id)]]
}

abstract class GenericElasticSearchCollection[T](docType: String)(implicit format: Format[T]) extends GenericCollection[T, String, Done] {

  def client = ElasticsearchClient(docType)

  override def insert(t: T)(implicit ctx: ExecutionContext): Future[(String, Done)] = {
    val id = IdGenerator.uuid
    val obj = format.writes(t).as[JsObject]
    obj \ "_id" match {
      case _:JsUndefined => {
        val doc = obj ++ Json.obj("_id" -> id)
        client.index(id, doc).map(d => (id, d))
      }
      case actualId => {
        client.index(actualId.as[String], obj).map(d => (actualId.as[String], d))
      }
    }
  }

  override def delete(id: String)(implicit ctx: ExecutionContext): Future[Done] = {
    client.delete(id)
  }

  override def update(id: String, t: T)(implicit ctx: ExecutionContext): Future[Done] = {
    client.update(id, format.writes(t).as[JsObject])
  }

  override def get(id: String)(implicit ctx: ExecutionContext): Future[Option[(T, String)]] = {
    client.get(id).map { d =>
      d.source match {
        case _: JsUndefined => None
        case jsvalue => {
          for {
            id <- d.id
            entity <- d.mapTo(format)
          } yield (entity, id)
        }
      }
    }
  }

  override def findAll()(implicit ctx: ExecutionContext): Future[Traversable[(T, String)]] = find(Json.obj())(ctx)

  override def find(sel: JsObject)(implicit ctx: ExecutionContext): Future[Traversable[(T, String)]] = {
    client.search(sel).map { result =>
      result.docs.value.map(d => (d, format.reads(d))).collect { case (d, JsSuccess(value, _)) => (value, (d \ "_id").as[String]) }
    }
  }

  override def findOne(sel: JsObject)(implicit ctx: ExecutionContext): Future[Option[(T, String)]] = {
    find(sel).map(_.headOption)
  }
}

// ES part

case class Index(index: String, docType: String, id: String, doc: JsObject)
case class Update(index: String, docType: String, id: String, doc: JsObject)
case class Delete(index: String, docType: String, id: String)
case class Get(index: String, docType: String, id: String)
case class Search(index: Option[String], docType: Option[String], query: JsObject)
case class Done(doc: JsObject)
case class Doc(doc: JsObject) {
  def source: JsValue = {
    doc \ "_source"
  }
  def mapTo[T](implicit r: Reads[T]): Option[T] = {
    r.reads(doc \ "_source").asOpt
  }
  def id: Option[String] = {
    (doc \ "_source" \ "_id").asOpt[String]
  }
}
case class Docs(docs: JsArray) {
  def mapTo[T](implicit r: Reads[T]): List[T] = {
    docs.value.map(_ \ "_source").map(doc => r.reads(doc)).filter(r => r.isSuccess).map(_.get).toList
  }
}

class ElasticSearchClientActor(name: String, esUrl: String, timeout: Long) extends Actor {

  implicit val ec = context.dispatcher

  override def receive: Receive = {
    case Index(index, docType, id, doc) => {
      val theSender = sender()
      WS.url(s"$esUrl/$index/$docType/$id").withRequestTimeout(timeout.toInt).put(doc).map(resp => theSender ! Done(resp.json.as[JsObject]))
    }
    case Update(index, docType, id, doc) => {
      val theSender = sender()
      WS.url(s"$esUrl/$index/$docType/$id/_update").withRequestTimeout(timeout.toInt).post(Json.obj("doc" -> doc)).map(_ => theSender ! Done(Json.obj()))
    }
    case Delete(index, docType, id) => {
      val theSender = sender()
      WS.url(s"$esUrl/$index/$docType/$id").withRequestTimeout(timeout.toInt).delete().map(resp => theSender ! Done(resp.json.as[JsObject]))
    }
    case Get(index, docType, id) => {
      val theSender = sender()
      WS.url(s"$esUrl/$index/$docType/$id").withRequestTimeout(timeout.toInt).get().map(resp => theSender ! Doc(resp.json.as[JsObject]))
    }
    case Search(index, docType, query) => {
      val theSender = sender()
      WS.url(s"$esUrl${index.map(v => "/" + v).getOrElse("")}${docType.map(v => "/" + v).getOrElse("")}/_search")
        .withRequestTimeout(timeout.toInt).post(query)
        .map(resp => theSender ! Docs((resp.json.as[JsObject] \ "hits" \ "hits").as[JsArray] ))
    }
    case _ =>
  }
}

class ElasticsearchClient(actorName: String, url: String, actorTimeout: Timeout, index: String, docType: String) {
  def index(id: String, doc: JsObject): Future[Done] = {
    akka.pattern.ask(Akka.system.actorSelection(s"/user/$actorName"), Index(index, docType, id, doc))(actorTimeout).mapTo[Done]
  }
  def update(id: String, doc: JsObject): Future[Done] = {
    akka.pattern.ask(Akka.system.actorSelection(s"/user/$actorName"), Update(index, docType, id, doc))(actorTimeout).mapTo[Done]
  }
  def delete(id: String): Future[Done] = {
    akka.pattern.ask(Akka.system.actorSelection(s"/user/$actorName"), Delete(index, docType, id))(actorTimeout).mapTo[Done]
  }
  def get(id: String): Future[Doc] = {
    akka.pattern.ask(Akka.system.actorSelection(s"/user/$actorName"), Get(index, docType, id))(actorTimeout).mapTo[Doc]
  }
  def search(query: JsObject): Future[Docs] = {
    akka.pattern.ask(Akka.system.actorSelection(s"/user/$actorName"), Search(Some(index), Some(docType), query))(actorTimeout).mapTo[Docs]
  }
}

object ElasticsearchClient {

  import play.api.Play.current

  val actorName = current.configuration.getString("portal.actorName").getOrElse("ElasticSearchClientActor")
  val actorTimeout = current.configuration.getMilliseconds("portal.actorTimeout").map(Timeout(_, TimeUnit.MILLISECONDS)).getOrElse(Timeout(11, TimeUnit.SECONDS))
  val wsTimeout = current.configuration.getMilliseconds("portal.wsTimeout").map(Timeout(_, TimeUnit.MILLISECONDS)).getOrElse(Timeout(10, TimeUnit.SECONDS))
  val esUrl = current.configuration.getString("portal.esUrl").getOrElse("http://localhost:9200")
  val esIndex = current.configuration.getString("portal.esIndex").getOrElse("portal")

  def apply(d: String, i: String = esIndex, n: String = actorName, u: String = esUrl, t: Timeout = actorTimeout): ElasticsearchClient = {
    new ElasticsearchClient(n, u, t, i, d)
  }
}

/*
Json.obj(
  "query" -> Json.obj(
    "term" -> Json.obj("writer" -> "jay")
  )
)).map(doc => Ok(doc))
*/