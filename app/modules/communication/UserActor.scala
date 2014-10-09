package modules.communication

import akka.actor.{Actor, ActorRef}
import modules.identity.User
import modules.jwt.JsonWebToken
import modules.structure.{Page, PagesStore}
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.Codecs
import play.api.libs.json._

import scala.concurrent.{Future, Promise}

// verification with http://jwt.io/
class UserActor(out: ActorRef, fuser: Future[User]) extends Actor {

  val topics = Map[String, (JsObject, String, JsValue) => Unit](
    "/portal/topics/identity" -> securityTopic,
    "/portal/topics/structure" -> structureTopic,
    "/portal/topics/default" -> defaultTopic
  )

  val promise = Promise[Unit]()
  implicit val ec = context.dispatcher

  def tokenAndUser(): Future[(String, JsValue)] = {
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
      (token, userJson)
    }
  }

  override def receive: Receive = {
    case js: JsValue => {
      val token = (js \ "token").asOpt[String]
      if (!promise.isCompleted) {
        promise.trySuccess(())
        tokenAndUser().map(t => defaultTopic(js.as[JsObject], t._1, t._2))
      } else if (JsonWebToken.validate(token.getOrElse(""))) {
        tokenAndUser().map(t => topics.get((js \ "topic").as[String]).map(_.apply(js.as[JsObject], t._1, t._2)))
      } else {
        Logger.error(s"Non token request on ${(js \ "topic").as[String]}")
      }
    }
    case e => Logger.error(s"User actor received weird message $e")
  }

  // TODO : be careful about user rights

  def defaultTopic(js: JsObject, token: String, userJson: JsValue): Unit = {
    (js \ "command").as[String] match {
      case "first" => PagesStore.findByUrl((js \ "url").as[String]).map {
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

  def securityTopic(js: JsObject, token: String, userJson: JsValue): Unit  = {
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

  def structureTopic(js: JsObject, token: String, userJson: JsValue): Unit  = {
    (js \ "payload" \ "command").as[String] match {
      case "subPages" => {
        val page = (js \ "payload" \ "from").as[String]
        for {
          user <- fuser
          subPages <- PagesStore.subPages(user, page)
          _ <- Future.successful(out ! Json.obj(
            "correlationId" -> (js \ "correlationId"),
            "token" -> token,
            "response" -> Writes.seq(Page.pageFmt).writes(subPages)
          ))
        } yield ()
      }
      case e => Logger.error(s"Unknown security command : $e")
    }
  }
}
