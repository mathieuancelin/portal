package controllers

import java.util.concurrent.TimeUnit

import common.IdGenerator
import modules.Env
import modules.identity.{User, Credential}
import play.api.cache.Cache
import play.api.libs.Crypto
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller, Cookie, DiscardingCookie}
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import scala.concurrent.Future
import scala.concurrent.duration.Duration
import play.api.Play.current
import play.api.data._
import play.api.data.Forms._

// TODO : oauth2 authentication builtin ???
// TODO : delegate authentication cascade style
// TODO : notify external system about authentfication/login
object Authentication extends Controller {

  val cookieName = "PORTAL_SSO"
  val discard = Seq(
    DiscardingCookie(name = cookieName, path = "/", domain = None),
    DiscardingCookie(name = Application.cookieName, path = "/", domain = None)
  )
  val loginForm = Form(
    tuple(
      "login" -> text,
      "password" -> text,
      "service" -> text
    )
  )

  def buildCookie(login: String) = {
    Cookie(
      name = cookieName,
      value = Crypto.encryptAES(s"${Crypto.sign(login)}:::$login"),
      maxAge = Some(2592000),
      path = "/",
      domain = None
    )
  }

  def loginPage(service: String) = Action.async { rh =>
    rh.cookies.get(cookieName).map { cookie: Cookie =>
      Crypto.decryptAES(cookie.value).split(":::").toList match {
        case hash :: login :: Nil if Crypto.sign(login) == hash => {
          Env.userStore.findByEmail(login).flatMap {
            case None => Future.successful(Ok(views.html.login(Application.portalName, service)).discardingCookies(discard:_*))
            case Some(user) => {
              val ticket = IdGenerator.uuid
              // Ticket is only available for the next 60 seconds
              Cache.set(s"ticket-$ticket", Json.stringify(user.toJson), Duration(60, TimeUnit.SECONDS))
              if (service.contains("?")) {
                Future.successful(Redirect(service + "&ticket=" + Crypto.encryptAES(ticket)).withCookies(buildCookie(login)))
              } else {
                Future.successful(Redirect(service + "?ticket=" + Crypto.encryptAES(ticket)).withCookies(buildCookie(login)))
              }
            }
          }
        }
        case _ => Future.successful(Ok(views.html.login(Application.portalName, service)).discardingCookies(discard:_*))
      }
    }.getOrElse(Future.successful(Ok(views.html.login(Application.portalName, service)).discardingCookies(discard:_*)))
  }

  def validate(ticket: String) = Action {
    Cache.getAs[String](s"ticket-${Crypto.decryptAES(ticket)}") match {
      case None => NotFound
      case Some(infos) => {
        Cache.remove(s"ticket-$ticket")
        Ok(Json.parse(infos))
      }
    }
  }

  def login() = Action.async { implicit request =>
    loginForm.bindFromRequest().fold(
      error => Future.successful(BadRequest("Bad login form")),
      tuple => {
        val (login, password, service) = tuple
        val salted = s"$password:::${Credential.salt}"
        // TODO : check service in actual datastore
        if (service != Application.portalCallbackUrl) {
          Future.successful(Redirect(routes.Authentication.error()))
        } else {
          Env.credentialsStore.findById(login).flatMap {
            case Some(credential) if Crypto.sign(salted) == credential.password => {
              Env.userStore.findByEmail(credential._id)
            }
            case _ => Future.successful(None)
          }.flatMap {
            case None => {
              Future.successful(Redirect(routes.Authentication.error()))
            }
            case Some(user) => {
              val ticket = IdGenerator.uuid
              // Ticket is only available for the next 60 seconds
              Cache.set(s"ticket-$ticket", Json.stringify(user.toJson), Duration(60, TimeUnit.SECONDS))
              if (service.contains("?")) {
                Future.successful(Redirect(service + "&ticket=" + Crypto.encryptAES(ticket)).withCookies(buildCookie(login)))
              } else {
                Future.successful(Redirect(service + "?ticket=" + Crypto.encryptAES(ticket)).withCookies(buildCookie(login)))
              }
            }
          }
        }
      }
    )

  }

  def logout = Action {
    Redirect("/").discardingCookies(discard:_*)
  }

  def error = Action {
    Ok("Error !!!!")
  }

}
