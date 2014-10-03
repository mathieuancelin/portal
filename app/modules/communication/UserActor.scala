package modules.communication

import akka.actor.{Actor, ActorRef}
import modules.identity.User
import modules.jwt.JsonWebToken
import modules.structure.{Page, PagesStore}
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.Codecs
import play.api.libs.json._

import scala.concurrent.Promise

class UserActor(out: ActorRef, user: User) extends Actor {

  val topics = Map[String, (JsObject) => Unit](
    "/portal/topics/identity" -> securityTopic,
    "/portal/topics/structure" -> structureTopic,
    "/portal/topics/default" -> defaultTopic
  )

  val promise = Promise[Unit]()

  def tokenAndUser(): (String, JsValue) = {
    val userJson = User.userFmt.writes(user).as[JsObject] ++ Json.obj(
      "md5email" -> Codecs.md5(user.email.getBytes)
    ) ++ Json.obj(
      "date" -> DateTime.now().toString("yyyy-MM-dd-HH-mm-ss-SSS")
    )
    val token: String = JsonWebToken(userJson).encrypt().toOption.getOrElse("")
    (token, userJson)
  }

  override def receive: Receive = {
    case js: JsValue => {
      val token = (js \ "token").asOpt[String]
      //Logger.info(token.getOrElse(""))
      if (!promise.isCompleted) {
        promise.trySuccess(())
        defaultTopic(js.as[JsObject])
      } else if (JsonWebToken.validate(token.getOrElse(""))) {
        topics.getOrElse((js \ "topic").as[String], defaultTopic(_))(js.as[JsObject])
      } else {
        Logger.error(s"Non token request on ${(js \ "topic").as[String]}")
      }
    }
    case e => Logger.error(s"User actor received weird message $e")
  }

  // TODO : be careful about user rights

  def defaultTopic(js: JsObject) = {
    val (token, userJson) = tokenAndUser()
    (js \ "command").as[String] match {
      case "first" => out ! Json.obj(
        "token" -> token,
        "page" -> Page.pageFmt.writes(PagesStore.findByUrl((js \ "url").as[String]).get),
        "user" -> userJson,
        "firstConnection" -> true
      )
    }
  }

  def securityTopic(js: JsObject) = {
    (js \ "payload" \ "command").as[String] match {
      case "WHOAMI" => {
        val (token, userJson) = tokenAndUser()
        out ! Json.obj(
          "correlationId" -> (js \ "correlationId"),
          "token" -> token,
          "response" -> userJson
        )
      }
      case e => Logger.error(s"Unknown security command : $e")
    }
  }

  def structureTopic(js: JsObject) = {
    (js \ "payload" \ "command").as[String] match {
      case "subPages" => {
        val page = (js \ "payload" \ "from").as[String]
        val subPages = PagesStore.subPages(user, page)
        val (token, _) = tokenAndUser()
        out ! Json.obj(
          "correlationId" -> (js \ "correlationId"),
          "token" -> token,
          "response" -> Writes.seq(Page.pageFmt).writes(subPages)
        )
      }
      case e => Logger.error(s"Unknown security command : $e")
    }
  }
}
