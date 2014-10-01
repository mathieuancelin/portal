package modules.communication

import akka.actor.{Actor, ActorRef}
import modules.identity.User
import modules.structure.{PagesStore, Page}
import play.api.Logger
import play.api.libs.{Codecs, Crypto}
import play.api.libs.json.{Writes, JsObject, Json, JsValue}
import play.api.mvc.Codec

class UserActor(out: ActorRef, user: User) extends Actor {

  val topics = Map[String, (JsObject) => Unit](
    "/portal/topics/identity" -> securityTopic,
    "/portal/topics/structure" -> structureTopic,
    "/portal/topics/default" -> defaultTopic
  )

  override def receive: Receive = {
    case js: JsValue => topics.getOrElse((js \ "topic").as[String], defaultTopic(_))(js.as[JsObject])
    case e => Logger.error(s"User actor received weird message $e")
  }

  // TODO : be careful about user rights

  def defaultTopic(js: JsObject) = {

  }

  def securityTopic(js: JsObject) = {
    (js \ "payload" \ "command").as[String] match {
      case "WHOAMI" => {
        out ! Json.obj(
          "correlationId" -> (js \ "correlationId"),
          "response" -> (User.userFmt.writes(user).as[JsObject] ++ Json.obj("md5email" -> Codecs.md5(user.email.getBytes())))
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
        out ! Json.obj(
          "correlationId" -> (js \ "correlationId"),
          "response" -> Writes.seq(Page.pageFmt).writes(subPages)
        )
      }
      case e => Logger.error(s"Unknown security command : $e")
    }
  }
}
