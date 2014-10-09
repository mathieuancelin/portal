package controllers

import akka.actor.{ActorRef, Props}
import modules.communication.UserActor
import modules.identity.{Role, AnonymousUser, User, UsersStore}
import modules.structure.{Mashete, MashetesStore, Page, PagesStore}
import play.api.Logger
import play.api.Play.current
import play.api.libs.Crypto
import play.api.libs.json.{Writes, Json, JsValue}
import play.api.mvc._

// TODO : mashetes store to add mashetes to pages
// TODO : add pages management
// TODO : add users management page
// TODO : add account management page
// TODO : history API hooks for mashetes
// TODO : url management API for mashetes (with #)

object Application extends Controller {

  lazy val portalName = play.api.Play.current.configuration.getString("portal.name").getOrElse("Portal")

  def UserAction(url: String)(f: ((Request[AnyContent], User, Page)) => Result) = {
    Logger.trace(s"Accessing secured url : $url")
    Action { rh =>
      val user = rh.cookies.get("PORTAL_SESSION").flatMap { cookie: Cookie =>
        cookie.value.split(":::").toList match {
          case hash :: userLogin :: Nil if Crypto.sign(userLogin) == hash => UsersStore.user(userLogin)
          case _ => Some(AnonymousUser)
        }
      }.getOrElse(AnonymousUser)
      PagesStore.findByUrl(url) match {
        case Some(page) => {
          if (page.accessibleByRoles.intersect(user.actualRoles).size > 0) {
            f(rh, user, page)
          } else {
            // TODO : redirect to login page
            InternalServerError("Not accessible moron")
          }
        }
        case None => NotFound("Page not found :'(")
      }
    }
  }

  def index = UserAction("/") {
    case (request, user, page) => Ok(views.html.index(portalName, user, page, MashetesStore.findAll()))
  }

  def page(url: String) = UserAction("/site/" + url) {
    case (request, user, page) => Ok(views.html.index(portalName, user, page, MashetesStore.findAll()))
  }

  def login = Action {
    val cookieValue = "mathieu.ancelin@acme.com"
    Redirect("/").withCookies(Cookie(
      name = "PORTAL_SESSION",
      value = s"${Crypto.sign(cookieValue)}:::$cookieValue",
      maxAge = Some(2592000),
      path = "/",
      domain = None
    ))
  }

  def logout = Action {
    Redirect("/").discardingCookies(DiscardingCookie(name = "PORTAL_SESSION", path = "/", domain = None))
  }

  def userWebsocket = WebSocket.acceptWithActor[JsValue, JsValue] { rh =>
    val user = rh.cookies.get("PORTAL_SESSION").flatMap { cookie: Cookie =>
      cookie.value.split(":::").toList match {
        case hash :: userLogin :: Nil if Crypto.sign(userLogin) == hash => UsersStore.user(userLogin)
        case _ => Some(AnonymousUser)
      }
    }.getOrElse(AnonymousUser)
    def builder(out: ActorRef) = Props(classOf[UserActor], out, user)
    builder
  }
}