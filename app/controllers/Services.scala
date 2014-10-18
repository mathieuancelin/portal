package controllers

import java.nio.charset.Charset
import java.util.concurrent.TimeUnit

import com.google.common.io.Files
import modules.Env
import modules.identity.{Credential, Role, User}
import modules.structure.{Mashete, Page}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json.{Json, Reads}
import play.api.mvc.{Action, Controller}

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}

object Services extends Controller {

  def firstTimeIndex = Action {
    if (play.api.Play.current.configuration.getBoolean("portal.allow-first-time-index").getOrElse(false)) {
      val utf8 = Charset.forName("UTF-8")
      val credentials = play.api.Play.current.getFile("conf/default-data/credentials.json")
      val roles = play.api.Play.current.getFile("conf/default-data/roles.json")
      val users = play.api.Play.current.getFile("conf/default-data/users.json")
      val mashetes = play.api.Play.current.getFile("conf/default-data/mashetes.json")
      val portal = play.api.Play.current.getFile("conf/default-data/portal.json")
      val future = for {
        _ <- Env.credentialsStore.deleteAll()
        _ <- Env.pageStore.deleteAll()
        _ <- Env.userStore.deleteAll()
        _ <- Env.roleStore.deleteAll()
        _ <- Env.masheteStore.deleteAll()
        _ <- Future.sequence(Json.parse(Files.toString(credentials, utf8)).as(Reads.seq(Credential.credentialFmt)).map(Env.credentialsStore.save))
        _ <- Future.sequence(Json.parse(Files.toString(roles, utf8)).as(Reads.seq(Role.roleFmt)).map(Env.roleStore.save))
        _ <- Future.sequence(Json.parse(Files.toString(users, utf8)).as(Reads.seq(User.userFmt)).map(Env.userStore.save))
        _ <- Future.sequence(Json.parse(Files.toString(mashetes, utf8)).as(Reads.seq(Mashete.masheteFmt)).map(Env.masheteStore.save))
        _ <- Future.sequence(Json.parse(Files.toString(portal, utf8)).as(Reads.seq(Page.pageFmt)).map(Env.pageStore.save))
      } yield ()
      Await.result(future, Duration(1, TimeUnit.MINUTES))
    }
    Ok
  }
}
