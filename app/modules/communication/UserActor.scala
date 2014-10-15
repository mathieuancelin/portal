package modules.communication

import akka.actor.{Actor, ActorRef}
import common.IdGenerator
import modules.Env
import modules.identity.User
import modules.jwt.JsonWebToken
import modules.structure._
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.Codecs
import play.api.libs.json._
import reactivemongo.bson.BSONObjectID

import scala.concurrent.{Future, Promise}
import scala.util.{Failure, Success}

// verification with http://jwt.io/
class UserActor(out: ActorRef, fuser: Future[User]) extends Actor {

  val topics = Map[String, (JsObject, String, JsValue, User) => Unit](
    "/portal/topics/identity" -> securityTopic,
    "/portal/topics/structure" -> structureTopic,
    "/portal/topics/default" -> defaultTopic
  )

  val promise = Promise[Unit]()
  implicit val ec = context.dispatcher

  def tokenAndUser(): Future[(String, JsValue, User)] = {
    fuser.map { user =>
      val userJson = User.userFmt.writes(user).as[JsObject] ++ Json.obj(
        "md5email" -> Codecs.md5(user.email.getBytes)
      ) ++ Json.obj(
        "iat" -> DateTime.now().toString("yyyy-MM-dd-HH-mm-ss-SSS"),
        "jti" -> common.IdGenerator.uuid,
        "iss" -> "http://theportal.ovh",
        "sub" -> user.email
      )
      val token: String = JsonWebToken(userJson).encrypt().toOption.getOrElse("")
      (token, userJson, user)
    }
  }

  override def receive: Receive = {
    case js: JsValue => {
      val token = (js \ "token").asOpt[String]
      if (!promise.isCompleted) {
        promise.trySuccess(())
        tokenAndUser().map(t => defaultTopic(js.as[JsObject], t._1, t._2, t._3))
      } else if (JsonWebToken.validate(token.getOrElse(""))) {
        val topic = (js \ "topic").as[String]
        val command = (js \ "payload" \ "command").as[String]
        val slug = js.as[JsObject]
        tokenAndUser().map { tu =>
          topics.get(topic) match {
            case Some(fun) => fun(slug, tu._1, tu._2, tu._3)
            case None => Logger.error("Not a valid topic")
          }
        }
      } else {
        Logger.error(s"Non token request on ${(js \ "topic").as[String]}")
      }
    }
    case e => Logger.error(s"User actor received weird message $e")
  }

  // TODO : be careful about user rights

  def defaultTopic(js: JsObject, token: String, userJson: JsValue, user: User): Unit = {
    (js \ "command").as[String] match {
      case "first" => Env.pageStore.findByUrl((js \ "url").as[String]).map {
        case Some(page) => Page.pageFmt.writes(page)
        case _ => Json.obj()
      }.map { result =>
        out ! Json.obj(
          "token" -> token,
          "page" -> result,
          "user" -> userJson,
          "firstConnection" -> true
        )
      }
    }
  }

  def securityTopic(js: JsObject, token: String, userJson: JsValue, user: User): Unit  = {
    (js \ "payload" \ "command").as[String] match {
      case "WHOAMI" => {
        out ! Json.obj(
          "correlationId" -> (js \ "correlationId"),
          "token" -> token,
          "response" -> userJson
        )
      }
      case e => Logger.error(s"Unknown security command : $e")
    }
  }

  def structureTopic(js: JsObject, token: String, userJson: JsValue, user: User): Unit  = {
    Logger.info("Command is " + (js \ "payload" \ "command").as[String])
    (js \ "payload" \ "command").as[String] match {
      case "subPages" => {
        val page = (js \ "payload" \ "from").as[String]
        Env.pageStore.subPages(user, page) onComplete {
          case Success(subPages) => {
            out ! Json.obj(
              "correlationId" -> (js \ "correlationId"),
              "token" -> token,
              "response" -> Writes.seq(Page.pageFmt).writes(subPages)
            )
          }
          case Failure(e) => e.printStackTrace()
        }
      }
      case "addMashete" => {
        val fromId = (js \ "payload" \ "from").as[String]
        val masheteId = (js \ "payload" \ "id").as[String]
        Env.pageStore.findById(fromId).map {
          case None => Logger.error("page not found")// TODO : notification failed
          case Some(page) => {
            Env.masheteStore.findById(masheteId).map {
              case None =>  Logger.error("mashete not found")// TODO : notification failed
              case Some(mashete) => {
                val masheteInstance = MasheteInstance(
                  BSONObjectID.generate.stringify,
                  mashete._id,
                  Position(0, 0),
                  mashete.defaultParam
                )
                val newPage = page.copy(mashetes = page.mashetes.map { instance =>
                  if (instance.position.column == 0) {
                    instance.copy(position = instance.position.copy(line = instance.position.line + 1))
                  } else {
                    instance
                  }
                })
                Env.pageStore.save(newPage.copy(mashetes = newPage.mashetes :+ masheteInstance)).map { page =>
                  out ! Json.obj(
                    "correlationId" -> (js \ "correlationId"),
                    "token" -> token,
                    "response" -> Json.obj()
                  )
                }.onFailure {
                  case e => Logger.error("fail to save", e)
                }
              }
            }
          }
        }
      }
      case "removeMashete" => {
        val fromId = (js \ "payload" \ "from").as[String]
        val masheteId = (js \ "payload" \ "id").as[String]
        Env.pageStore.findById(fromId).map {
          case None => Logger.error("page not found")// TODO : notification failed
          case Some(page) => {
            // TODO : move other mashetes
            val newMashetes = page.mashetes.filterNot(_.id == masheteId)

            Env.pageStore.save(page.copy(mashetes = page.mashetes.filterNot(_.id == masheteId))).map { page =>
              out ! Json.obj(
                "correlationId" -> (js \ "correlationId"),
                "token" -> token,
                "response" -> Json.obj()
              )
            }
          }
        }
      }
      case "moveMashete" => {
        val fromId = (js \ "payload" \ "from").as[String]
        val masheteId = (js \ "payload" \ "id").as[String]
        val previousColumn = (js \ "payload" \ "previous" \ "column").as[Int]
        val previousLine = (js \ "payload" \ "previous" \ "line").as[Int]
        val currentColumn = (js \ "payload" \ "current" \ "column").as[Int]
        val currentLine = (js \ "payload" \ "current" \ "line").as[Int]
      }
      case "addPage" => {
        val page = (js \ "payload" \ "page").as[JsObject]
        val parentId = (js \ "payload" \ "from").as[String]
        Env.pageStore.findById(parentId) map {
          case Some(parentPage) => {
            // TODO : check if page not exists
            // TODO : check url valid
            // TODO : check url not exists
            val actualPage = Page(
              IdGenerator.uuid,
              (page \ "name").as[String],
              (page \ "description").as[String],
              parentPage.url match {
                case url if url.startsWith("/site") => url + "/" + (page \ "url").as[String]
                case url => url + "site/" + (page \ "url").as[String]
              },
              (page \ "accessibleByIds").as[Seq[String]],
              Seq[String](),
              Seq[MasheteInstance](),
              (page \ "leftColSize").asOpt[Int].getOrElse(play.api.Play.current.configuration.getInt("portal.left-width").getOrElse(6)),
              (page \ "rightColSize").asOpt[Int].getOrElse(play.api.Play.current.configuration.getInt("portal.right-width").getOrElse(6))
            )

            val newParentPage = parentPage.copy(subPageIds = parentPage.subPageIds :+ actualPage._id)
            Env.pageStore.save(newParentPage).onComplete {
              case Failure(e) => e.printStackTrace()// TODO : notification failed
              case Success(_) =>
            }
            Env.pageStore.save(actualPage).onComplete {
              case Success(_) => {
                out ! Json.obj(
                  "correlationId" -> (js \ "correlationId"),
                  "token" -> token,
                  "response" -> Json.obj(
                    "__commandRedirect" -> actualPage.url
                  )
                )
              }
              case Failure(e) => e.printStackTrace()// TODO : notification failed
            }
          }
          case None =>  // TODO : notification failed
        }
      }
      case e => Logger.error(s"Unknown security command : $e")
    }
  }
}
