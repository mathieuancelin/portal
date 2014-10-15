package modules.communication

import java.util

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
      case "allRoles" => {
        Env.roleStore.findAll().map { roles =>
          out ! Json.obj(
            "correlationId" -> (js \ "correlationId"),
            "token" -> token,
            "response" -> Writes.seq[String].writes(roles.map(_._id))
          )
        }
      }
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
            val mashete = page.mashetes.find(_.id == masheteId).get
            val newMashetes = page.mashetes.filterNot(_.id == masheteId).map { instance =>
              if (instance.position.column == mashete.position.column && instance.position.line > mashete.position.line) {
                instance.copy(position = instance.position.copy(line = instance.position.line - 1))
              } else {
                instance
              }
            }
            Env.pageStore.save(page.copy(mashetes = newMashetes)).map { page =>
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
        Logger.info(Json.prettyPrint(js \ "payload"))
        val fromId = (js \ "payload" \ "from").as[String]
        val masheteId = (js \ "payload" \ "id").as[String]
        val previousColumn = (js \ "payload" \ "previous" \ "column").as[String].toInt
        val previousLine = (js \ "payload" \ "previous" \ "line").as[String].toInt
        val currentColumn = (js \ "payload" \ "current" \ "column").as[String].toInt
        val currentLine = (js \ "payload" \ "current" \ "line").as[String].toInt
        Env.pageStore.findById(fromId).map {
          case None => Logger.error("page not found")// TODO : notification failed
          case Some(page) => {
            //Logger.info(s"id       : $masheteId   " )
            //Logger.info(s"previous : $previousColumn : $previousLine")
            //Logger.info(s"current  : $currentColumn : $currentLine")
            //Logger.info("old : " + page.mashetes.map(t => (t.id, t.position)))
            try {
              val left: java.util.ArrayList[MasheteInstance] = new util.ArrayList[MasheteInstance]()
              val right: java.util.ArrayList[MasheteInstance] = new util.ArrayList[MasheteInstance]()
              page.mashetes.filter(_.position.column == 0).sortBy(_.position.line).toList.foreach(left.add)
              page.mashetes.filter(_.position.column == 1).sortBy(_.position.line).toList.foreach(right.add)
              val mashete: MasheteInstance = page.mashetes.find(_.id == masheteId).get
              if (previousColumn == 0) {
                left.remove(mashete)
              } else {
                right.remove(mashete)
              }
              if (currentColumn == 0) {
                left.add(currentLine, mashete)
              } else {
                right.add(currentLine, mashete)
              }
              var leftSeq = Seq[MasheteInstance]()
              var rightSeq = Seq[MasheteInstance]()
              import collection.JavaConversions._
              for (item <- left) {
                leftSeq = leftSeq :+ item
              }
              for (item <- right) {
                rightSeq = rightSeq :+ item
              }
              leftSeq = leftSeq.zipWithIndex.map { tuple =>
                tuple._1.copy(position = Position(0, tuple._2))
              }
              rightSeq = rightSeq.zipWithIndex.map { tuple =>
                tuple._1.copy(position = Position(1, tuple._2))
              }
              val newMashetes = leftSeq ++ rightSeq
              //Logger.info("new : " + newMashetes.map(t => (t.id, t.position)))
              Env.pageStore.save(page.copy(mashetes = newMashetes)).map { page =>
                out ! Json.obj(
                  "correlationId" -> (js \ "correlationId"),
                  "token" -> token,
                  "response" -> Json.obj()
                )
              }
            } catch {
              case e: Throwable => e.printStackTrace()
            }
          }
        }
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
