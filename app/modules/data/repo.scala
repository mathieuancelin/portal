package modules.data

import play.api.libs.json.{JsObject, JsString, JsUndefined, Json}
import play.modules.reactivemongo.ReactiveMongoPlugin
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.bson.BSONObjectID
import play.api.Play.current
import play.modules.reactivemongo.json.BSONFormats._

import scala.concurrent.{ExecutionContext, Future}

// TODO : filter by mashete type
object UserRepo {

  lazy val collection = ReactiveMongoPlugin.db.collection[JSONCollection]("userstore")

  def deleteAll(user: String)(implicit ec: ExecutionContext): Future[Unit] = {
    collection.remove(Json.obj("__user" -> user)).map(_ => ())
  }
  def findById(user: String, id: String)(implicit ec: ExecutionContext): Future[Option[JsObject]] = {
    collection.find(Json.obj("_id" -> id, "__user" -> user)).cursor[JsObject].headOption
  }
  def findAll(user: String)(implicit ec: ExecutionContext): Future[Seq[JsObject]] = {
    collection.find(Json.obj("__user" -> user)).cursor[JsObject].collect[Seq]()
  }
  def search(user: String, query: JsObject)(implicit ec: ExecutionContext): Future[Seq[JsObject]] = {
    val actualQuery = query \ "__user" match {
      case JsUndefined() => query ++ Json.obj("__user" -> user)
      case _ => {
        val tmp = query - "__user"
        tmp ++ Json.obj("__user" -> user)
      }
    }
    collection.find(actualQuery).cursor[JsObject].collect[Seq]()
  }
  def delete(user: String, id: String)(implicit ec: ExecutionContext): Future[Unit] = {
    collection.remove(Json.obj("_id" -> id, "__user" -> user)).map(_ => ())
  }
  def delete(user: String, query: JsObject)(implicit ec: ExecutionContext): Future[Unit] = {
    val actualQuery = query \ "__user" match {
      case JsUndefined() => query ++ Json.obj("__user" -> user)
      case _ => {
        val tmp = query - "__user"
        tmp ++ Json.obj("__user" -> user)
      }
    }
    println("removing " + Json.prettyPrint(actualQuery))
    collection.remove(actualQuery).map(_ => ())
  }
  def save(user: String, obj: JsObject)(implicit ec: ExecutionContext): Future[JsObject] = {
    val actualObj: JsObject = obj \ "__user" match {
      case JsUndefined() => obj ++ Json.obj("__user" -> user)
      case _ => {
        val tmp = obj - "__user"
        tmp ++ Json.obj("__user" -> user)
      }
    }
    val id = (actualObj \ "_id").asOpt[String].getOrElse(BSONObjectID.generate.stringify)
    findById(user, id).flatMap {
      case Some(m) => {
        collection.update(
          Json.obj("_id" -> id),
          Json.obj("$set" -> actualObj.-("_id"))
        ).map{ _ => actualObj }
      }
      case None => {
        actualObj \ "_id" match {
          case _: JsUndefined => collection.insert(actualObj ++ Json.obj("_id" -> id, "__user" -> user)).map { _ => actualObj }
          case JsObject(Seq((_, JsString(oid)))) => collection.insert(actualObj).map{ _ => actualObj }
          case JsString(oid) => collection.insert(actualObj).map{ _ => actualObj }
          case f => sys.error(s"Could not parse _id field: $f")
        }
      }
    }
  }
}