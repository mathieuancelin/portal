package controllers

import akka.actor.{ActorRef, Props}
import modules.communication.UserActor
import modules.identity.{AnonymousUser, User, UsersStore}
import modules.structure.{MashetesStore, Page, PagesStore}
import play.api.Logger
import play.api.Play.current
import play.api.libs.Crypto
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json.JsValue
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future

// TODO : mashetes store to add mashetes to pages
// TODO : add pages management
// TODO : add users management page
// TODO : add account management page
// TODO : history API hooks for mashetes
// TODO : url management API for mashetes (with #)

object Application extends Controller {

  lazy val portalName = play.api.Play.current.configuration.getString("portal.name").getOrElse("Portal")

  def UserAction(url: String)(f: ((Request[AnyContent], User, Page)) => Future[Result]) = {
    Logger.trace(s"Accessing secured url : $url")
    Action.async { rh =>
      val fuser: Future[User] = rh.cookies.get("PORTAL_SESSION").map { cookie: Cookie =>
        cookie.value.split(":::").toList match {
          case hash :: userLogin :: Nil if Crypto.sign(userLogin) == hash => UsersStore.user(userLogin)
        }
      }.getOrElse(Future.successful(Some(AnonymousUser))).map(_.getOrElse(AnonymousUser))
      fuser.flatMap { user =>
        PagesStore.findByUrl(url).flatMap {
          case Some(page) => {
            if (page.accessibleByIds.intersect(user.roles).size > 0) {
              f(rh, user, page)
            } else {
              // TODO : redirect to login page
              Future.successful(InternalServerError("Not accessible moron"))
            }
          }
          case None => Future.successful(NotFound("Page not found :'("))
        }
      }
    }
  }

  def index = UserAction("/") {
    case (request, user, page) => {
      for {
        subTree <- PagesStore.directSubPages(user, page).map(ps => Html(ps.map(p => p.toHtml(user)).mkString("")))
        all <- MashetesStore.findAll()
      } yield Ok(views.html.index(portalName, user, page, all, subTree))
    }
  }

  def page(url: String) = UserAction("/site/" + url) {
    case (request, user, page) => {
      for {
        root <- PagesStore.findByUrl("/")
        subTree <- PagesStore.directSubPages(user, root.getOrElse(page)).map(ps => Html(ps.map(p => p.toHtml(user)).mkString("")))
        all <- MashetesStore.findAll()
      } yield Ok(views.html.index(portalName, user, page, all, subTree))
    }
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
    val user: Future[User] = rh.cookies.get("PORTAL_SESSION").map { cookie: Cookie =>
      cookie.value.split(":::").toList match {
        case hash :: userLogin :: Nil if Crypto.sign(userLogin) == hash => UsersStore.user(userLogin)
        case _ => Future.successful(Some(AnonymousUser))
      }
    }.getOrElse(Future.successful(Some(AnonymousUser))).map(_.getOrElse(AnonymousUser))
    def builder(out: ActorRef) = Props(classOf[UserActor], out, user)
    builder
  }
}