package modules.structure

import common.IdGenerator
import modules.identity.{Admin, Anonymous, User, Writer}
import play.api.Logger
import play.api.libs.json.Json


object MashetesStore {


}

object PagesStore {

  val widgetsIndex = Seq(
    MasheteInstance("widget-1", "TitleMashete", Position(0, 0), Json.obj("title" -> "Page description")),
    MasheteInstance("widget-2", "LinksMashete", Position(0, 2), Json.obj()),
    MasheteInstance("widget-2", "MarkdownMashete", Position(0, 1), Json.obj("title" -> "Mardown display", "markdown" -> "VGhpcyBpcyB5b3VyIG5ldyBQbGF5IGFwcGxpY2F0aW9uDQo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0NCg0KVGhpcyBmaWxlIHdpbGwgYmUgcGFja2FnZWQgd2l0aCB5b3VyIGFwcGxpY2F0aW9uLCB3aGVuIHVzaW5nIGBhY3RpdmF0b3IgZGlzdGAuDQo=")),
    MasheteInstance("widget-3", "IframeMashete", Position(1, 0), Json.obj("url" -> "https://www.playframework.com/", "title" -> "Playframework", "height" -> 600))
  )

  val widgetsPrivate = Seq(
    MasheteInstance("widget-1", "TitleMashete", Position(0, 0), Json.obj("title" -> "Page description")),
    MasheteInstance("widget-2", "LinksMashete", Position(0, 1), Json.obj()),
    MasheteInstance("widget-3", "IframeMashete", Position(1, 0), Json.obj("url" -> "http://underscorejs.org/", "title" -> "Underscore", "height" -> 600))
  )

  val privatePage = Page(IdGenerator.uuid, "My Private page", "", "/site/myprivatepage", Seq(Admin, Writer), Seq(), widgetsPrivate)

  val index = Page(IdGenerator.uuid, "Welcome to 'the Portal'", "The best portal ever ...", "/", Seq(Anonymous, Admin, Writer), Seq(privatePage), widgetsIndex)

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
    Logger.info(s"$from")
    Logger.info(s"${from == privatePage}")
    user.roles match {
      case Anonymous :: Nil => Seq()
      case _ if privatePage.id == from.id => Seq()
      case _ if privatePage.id != from.id => Seq(privatePage)
    }
  }
}