package modules.structure

import common.IdGenerator
import modules.identity.{Admin, Anonymous, User, Writer}
import play.api.libs.json.Json


object MashetesStore {


}

object PagesStore {

  val widgetsIndex = Seq(
    MasheteInstance("widget-1", "LinksMashete", Left, Json.obj()),
    MasheteInstance("widget-2", "LinksMashete", Left, Json.obj()),
    MasheteInstance("widget-3", "IframeMashete", Right, Json.obj("url" -> "https://www.playframework.com/", "title" -> "Playframework", "height" -> 600))
  )

  val widgetsPrivate = Seq(
    MasheteInstance("widget-1", "LinksMashete", Left, Json.obj()),
    MasheteInstance("widget-2", "IframeMashete", Right, Json.obj("url" -> "http://underscorejs.org/", "title" -> "Underscore", "height" -> 600))
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