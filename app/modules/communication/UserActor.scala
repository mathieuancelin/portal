package modules.communication

import java.util

import akka.actor.{Actor, ActorRef}
import common.IdGenerator
import modules.Env
import modules.data.UserRepo
import modules.identity.User
import modules.jwt.JsonWebToken
import modules.structure._
import org.joda.time.DateTime
import play.api.Logger
import play.api.Play.current
import play.api.libs.Codecs
import play.api.libs.json._
import play.api.libs.ws.WS
import reactivemongo.bson.BSONObjectID

import scala.concurrent.{Future, Promise}
import scala.util.{Failure, Success, Try}

trait NotificationType {
  def name: String
}

case object SuccessNotification extends NotificationType {
  def name = "success"
}
case object ErrorNotification extends NotificationType {
  def name = "error"
}
case object InfoNotification extends NotificationType {
  def name = "info"
}

// verification with http://jwt.io/
class UserActor(out: ActorRef, fuser: Future[User]) extends Actor {

  val topics = Map[String, (JsObject, String, JsValue, User) => Unit](
    "/portal/topics/identity" -> securityTopic,
    "/portal/topics/structure" -> structureTopic,
    "/portal/topics/eventbus" -> eventBusTopic,
    "/portal/topics/httpclient" -> httpClientTopic,
    "/portal/topics/repo" -> repoTopic,
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

  override def preStart(): Unit = {
    context.system.eventStream.subscribe(self, classOf[BroadcastMessage])
  }

  def redirect(to: String, in: JsValue, token: String) = {
    Logger.info(s"Sending redirection to $to")
    out ! Json.obj(
      "correlationId" -> (in \ "correlationId"),
      "token" -> token,
      "response" -> Json.obj(
        "__commandRedirect" -> to
      )
    )
  }

  def notifyUser(notificationType: NotificationType, title: String, message: String, in: JsValue, token: String) = {
    // TODO : log
    out ! Json.obj(
      "correlationId" -> (in \ "correlationId"),
      "token" -> token,
      "response" -> Json.obj(
        "__commandNotification" -> Json.obj(
          "title" -> title,
          "message" -> message,
          "notifcationType" -> notificationType.name
        )
      )
    )
  }

  def notifyError(e: Throwable, in: JsValue, token: String) = {
    e.printStackTrace()
    notifyUser(ErrorNotification, "Error", e.getMessage, in, token)
  }

  def notifyError(e: String, in: JsValue, token: String) = {
    Logger.error(e)
    notifyUser(ErrorNotification, "Error", e, in, token)
  }

  def respond(what: JsValue, token: String, in: JsValue) {
    // TODO : log
    out ! Json.obj(
      "correlationId" -> (in \ "correlationId"),
      "token" -> token,
      "response" -> what
    )
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
            case None => Logger.error(s"Not a valid topic : $topic")
          }
        }
      } else {
        redirect("/logout", js, token.get)
        Logger.error(s"Non token request on ${(js \ "topic").as[String]}")
      }
    }
    case BroadcastMessage(channel, payload) => {
      out ! Json.obj(
        "response" -> Json.obj(
          "__commandEventBus" -> Json.obj(
            "channel" -> channel,
            "payload" -> payload
          )
        )
      )
    }
    case UnicastMessage(userId, channel, payload) => {
      fuser.map { user =>
        if (user.email == userId) {
          out ! Json.obj(
            "response" -> Json.obj(
              "__commandEventBus" -> Json.obj(
                "channel" -> channel,
                "payload" -> payload
              )
            )
          )
        }
      }
    }
    case e => Logger.error(s"User actor received weird message $e")
  }

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
      case "WHOAMI" => respond(userJson, token, js)
      case e => Logger.error(s"Unknown security command : $e")
    }
  }
  def repoTopic(js: JsObject, token: String, userJson: JsValue, user: User): Unit  = {
    (js \ "payload" \ "command").as[String] match {
      case "deleteAll" => {
        UserRepo.deleteAll(user.email).map(_ => respond(Json.obj(), token, js))
      }
      case "findById"  => {
        val _id = (js \ "payload" \ "_id").as[String]
        UserRepo.findById(user.email, _id).map(doc => respond(doc.getOrElse(Json.obj()), token, js))
      }
      case "findAll"   => {
        UserRepo.findAll(user.email).map(seq => respond(JsArray(seq), token, js))
      }
      case "search"    => {
        val query = (js \ "payload" \ "query").as[JsObject]
        UserRepo.search(user.email, query).map(seq => respond(JsArray(seq), token, js))
      }
      case "delete"    => {
        val _id = (js \ "payload" \ "_id").as[String]
        UserRepo.delete(user.email, _id).map(_ => respond(Json.obj(), token, js))
      }
      case "deleteSelection"    => {
        val query = (js \ "payload" \ "query").as[JsObject]
        UserRepo.delete(user.email, query).map(_ => respond(Json.obj(), token, js))
      }
      case "save"      => {
        val doc = (js \ "payload" \ "doc").as[JsObject]
        UserRepo.save(user.email, doc).map(d => respond(d, token, js))
      }
      case e => Logger.error(s"Unknown repo command : $e")
    }
  }

  def eventBusTopic(js: JsObject, token: String, userJson: JsValue, user: User): Unit  = {
    (js \ "payload" \ "command").as[String] match {
      case "broadcast" => {
        val channel = (js \ "payload" \ "channel").as[String]
        val payload = (js \ "payload" \ "payload").as[JsObject]
        // TODO : make it work in a distributed environement
        context.system.eventStream.publish(new BroadcastMessage(channel, payload))
      }
      case "public" => {
        val channel = (js \ "payload" \ "channel").as[String]
        val payload = (js \ "payload" \ "payload").as[JsObject]
        // TODO : make it work in a distributed environement
        context.system.eventStream.publish(new UnicastMessage(user.email, channel, payload))
      }
      case e => Logger.error(s"Unknown security command : $e")
    }
  }

  def httpClientTopic(js: JsObject, token: String, userJson: JsValue, user: User): Unit  = {
    println(Json.prettyPrint(js \ "payload"))
    (js \ "payload" \ "command").as[String] match {
      case "execute" => {
        val options = (js \ "payload" \ "options").as[JsObject]
        val url = (options \ "url").as[String]
        val method = (options \ "method").as[String]
        val optParams = (options \ "params").asOpt[JsArray].map(_.value.map(_.as[String]).map(header => (header.split("=")(0), header.split("=")(1))))
        val optTimeout = (options \ "timeout").asOpt[Int]
        val optMediaType = (options \ "mediaType").asOpt[String]
        val optJsonBody = (options \ "body").asOpt[JsValue]
        val optStringBody = (options \ "body").asOpt[String]
        val optHeaders = (options \ "headers").asOpt[JsArray].map(_.value.map(_.as[String]).map(header => (header.split("=")(0), header.split("=")(1))))
        var holder = WS.url(url).withMethod(method)
        if (optParams.isDefined) {
          holder = holder.withQueryString(optParams.get:_*)
        }
        if (optTimeout.isDefined) {
          holder = holder.withRequestTimeout(optTimeout.get)
        }
        if (optMediaType.isDefined) {
          holder = holder.withHeaders("Media-Type" -> optMediaType.get)
        }
        if (optJsonBody.isDefined) {
          holder = holder.withBody(optJsonBody.get)
        }
        if (optStringBody.isDefined) {
          holder = holder.withBody(optStringBody.get)
        }
        if (optHeaders.isDefined) {
          holder = holder.withHeaders(optHeaders.get:_*)
        }
        holder.execute().onComplete {
          case Success(response) => {
            val json: JsValue = if (response.body.startsWith("\n// ")) Try(Json.parse(response.body.substring(3))).toOption.getOrElse(Json.obj()) else Try(response.json).toOption.getOrElse(Json.obj())
            respond(Json.obj(
              "status" -> "success",
              "success" -> true,
              "status" -> response.status,
              "statusText" -> response.statusText,
              "response" -> Json.obj(
                "raw" -> response.body,
                "json" -> json
              )
            ), token, js)
          }
          case Failure(e) => {
            e.printStackTrace()
            respond(Json.obj(
              "status" -> "failure",
              "success" -> false,
              "error" -> e.getMessage
            ), token, js)
          }
        }
      }
      case e => Logger.error(s"Unknown security command : $e")
    }
  }

  def structureTopic(js: JsObject, token: String, userJson: JsValue, user: User): Unit  = {
    Logger.info("Command is " + (js \ "payload" \ "command").as[String])
    (js \ "payload" \ "command").as[String] match {
      case "allRoles" => {
        Env.roleStore.findAll().map { roles =>
          respond(Writes.seq[String].writes(roles.map(_._id)), token, js)
        }
      }
      case "subPages" => {
        val page = (js \ "payload" \ "from").as[String]
        Env.pageStore.subPages(user, page) onComplete {
          case Success(subPages) => respond(Writes.seq(Page.pageFmt).writes(subPages), token, js)
          case Failure(e) => notifyError(e, js, token)
        }
      }
      case "addMashete" => {
        if (!user.isAdmin) return
        val fromId = (js \ "payload" \ "from").as[String]
        val masheteId = (js \ "payload" \ "id").as[String]
        Env.pageStore.findById(fromId).map {
          case None => notifyError("page not found", js, token)
          case Some(page) => {
            Env.masheteStore.findById(masheteId).map {
              case None =>  notifyError("mashete not found", js, token)
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
                  respond(Json.obj(
                    "masheteid" -> masheteInstance.id
                  ), token, js)
                }.onFailure {
                  case e => notifyError(s"fail to save page", js, token)
                }
              }
            }
          }
        }
      }
      case "removeMashete" => {
        if (!user.isAdmin) return
        val fromId = (js \ "payload" \ "from").as[String]
        val masheteId = (js \ "payload" \ "id").as[String]
        Env.pageStore.findById(fromId).map {
          case None => notifyError("page not found", js, token)
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
              respond(Json.obj(), token, js)
            }
          }
        }
      }
      case "moveMashetes" => {
        if (!user.isAdmin) return
        val fromId = (js \ "payload" \ "from").as[String]
        val mashetes = (js \ "payload" \ "mashetes").as[JsArray]
        Env.pageStore.findById(fromId).map {
          case None => notifyError("page not found", js, token)
          case Some(page) => {
            try {
              var newMashetes = Seq[MasheteInstance]()
              mashetes.value.map(_.as[JsObject]).foreach { jsObj =>
                val col = (jsObj \ "col").as[Int]
                val line = (jsObj \ "line").as[Int]
                val masheteid = (jsObj \ "masheteid").as[String]
                page.mashetes.find(_.id == masheteid).map { instance =>
                  newMashetes = newMashetes :+ instance.copy(position = Position(col, line))
                }
              }
              Env.pageStore.save(page.copy(mashetes = newMashetes)).map { page =>
                respond(Json.obj(), token, js)
              }
            } catch {
              case e: Throwable => notifyError(e, js, token)
            }
          }
        }
      }
      case "addPage" => {
        if (!user.isAdmin) return
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
              (page \ "colSizes").asOpt[Seq[String]].map(_.map(_.toInt)).getOrElse(Seq(6, 6))
            )

            val newParentPage = parentPage.copy(subPageIds = parentPage.subPageIds :+ actualPage._id)
            Env.pageStore.save(newParentPage).onComplete {
              case Failure(e) => notifyError(e, js, token)
              case Success(_) => Env.pageStore.save(actualPage).onComplete {
                case Success(_) => redirect(actualPage.url, js, token)
                case Failure(e) => notifyError(e, js, token)
              }
            }
          }
          case None =>  notifyError("Page not found", js, token)
        }
      }
      case "deletePage" => {
        if (!user.isAdmin) return
        val fromId = (js \ "payload" \ "from").as[String]
        Env.pageStore.findById(fromId).map {
          case None => notifyError("page not found", js, token)
          case Some(page) => {
            if (page.url != "/") {
              Env.pageStore.delete(page._id).andThen {
                case _ => redirect("/", js, token)
              }
            } else {
              notifyError("You can't delete the root page.", js, token)
            }
          }
        }
      }
      case "changeMasheteOptions" => {
        if (!user.isAdmin) return
        try {
          val fromId = (js \ "payload" \ "from").as[String]
          val masheteId = (js \ "payload" \ "id").as[String]
          val conf = (js \ "payload" \ "conf").as[JsObject]
          Env.pageStore.findById(fromId).map {
            case None => notifyError("page not found", js, token)
            case Some(page) => {
              val instance = page.mashetes.find(_.id == masheteId).get
              val mashetes = page.mashetes.filterNot(_.id == masheteId)
              val newConfig = instance.instanceConfig.deepMerge(conf)
              val newInstance = instance.copy(instanceConfig = newConfig)
              Env.pageStore.save(page.copy(mashetes = mashetes :+ newInstance)).andThen {
                case _ => respond(newConfig, token, js)
              }
            }
          }
        } catch {
          case e: Throwable => notifyError(e, js, token)
        }
      }
      case e => Logger.error(s"Unknown structure command : $e")
    }
  }
}
