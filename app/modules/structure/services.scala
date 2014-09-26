package modules.structure

import common.IdGenerator
import modules.identity.{Writer, Admin, Anonymous, User}
import play.api.Logger
import play.api.libs.json.Json


object MashetesStore {

}

object PagesStore {

  val widgetsIndex = Seq(
    MasheteInstance("hello-1", "hello-mashete", Center, Json.obj()),
    MasheteInstance("iframe-1", "iframe-mashete", Center, Json.obj("url" -> "http://www.google.fr")),
    MasheteInstance("iframe-2", "iframe-mashete", Center, Json.obj("url" -> "https://www.playframework.com/"))
  )

  val widgetsPrivate = Seq(
    MasheteInstance("private-1", "private-mashete", Center, Json.obj())
  )

  val privatePage = Page(IdGenerator.uuid, "My Private page", "", "/site/myprivatepage", Seq(Admin, Writer), Seq(), widgetsPrivate)

  val index = Page(IdGenerator.uuid, "Welcome to Portal", "", "/", Seq(Anonymous, Admin, Writer), Seq(privatePage), widgetsIndex)

  def findByUrl(url: String): Option[Page] = {  // For POC purpose only
    url match {
      case "/" => Some(index)
      case "/site/myprivatepage" => Some(privatePage)
      case _ => None
    }
  }

  def pages(user: User): Seq[Page] = { // For POC purpose only
    user.roles match {
      case Anonymous :: tail :: Nil => Seq(index)
      case _ => Seq(index, privatePage)
    }
  }

  def subPages(user: User, from: Page): Seq[Page] = {  // For POC purpose only
    user.roles match {
      case Anonymous :: Nil => Seq()
      case _ if privatePage == from => Seq()
      case _ if privatePage != from => Seq(privatePage)
    }
  }
}