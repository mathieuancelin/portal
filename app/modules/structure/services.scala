package modules.structure

import common.IdGenerator
import modules.identity.{Admin, Anonymous, User, Writer}
import play.api.libs.json.Json


object MashetesStore {


}

object PagesStore {

  val widgetsRoot = Seq(
    MasheteInstance("widget-2", "LinksMashete", Position(0, 0), Json.obj())
  )

  val widgetsIndex = Seq(
    MasheteInstance("widget-1", "TitleMashete", Position(0, 0), Json.obj("title" -> "Page description")),
    MasheteInstance("widget-2", "LinksMashete", Position(0, 2), Json.obj()),
    MasheteInstance("widget-2", "MarkdownMashete", Position(0, 1), Json.obj("title" -> "Mardown display", "markdown" -> "VGhpcyBpcyB5b3VyIG5ldyBQbGF5IGFwcGxpY2F0aW9uDQo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0NCg0KVGhpcyBmaWxlIHdpbGwgYmUgcGFja2FnZWQgd2l0aCB5b3VyIGFwcGxpY2F0aW9uLCB3aGVuIHVzaW5nIGBhY3RpdmF0b3IgZGlzdGAuDQo=")),
    MasheteInstance("widget-3", "IframeMashete", Position(1, 0), Json.obj("url" -> "https://www.playframework.com/", "title" -> "Playframework", "height" -> 600))
  )

  val wigetsPublic = Seq(
    MasheteInstance("widget-1", "TitleMashete", Position(0, 0), Json.obj("title" -> "Page description")),
    MasheteInstance("widget-2", "MarkdownMashete", Position(1, 0), Json.obj("title" -> "Mardown display", "markdown" -> "VGhpcyBpcyB5b3VyIG5ldyBQbGF5IGFwcGxpY2F0aW9uDQo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0NCg0KVGhpcyBmaWxlIHdpbGwgYmUgcGFja2FnZWQgd2l0aCB5b3VyIGFwcGxpY2F0aW9uLCB3aGVuIHVzaW5nIGBhY3RpdmF0b3IgZGlzdGAuDQo="))
  )

  val widgetsPrivate = Seq(
    MasheteInstance("widget-1", "TitleMashete", Position(0, 0), Json.obj("title" -> "Page description")),
    MasheteInstance("widget-2", "LinksMashete", Position(0, 1), Json.obj()),
    MasheteInstance("widget-3", "IframeMashete", Position(1, 0), Json.obj("url" -> "http://underscorejs.org/", "title" -> "Underscore", "height" -> 600))
  )

  val privatePage1 = Page(IdGenerator.uuid, "My Private page 1", "", "/site/private/myprivatepage1", Seq(Admin, Writer), Seq(), widgetsPrivate)
  val privatePage2 = Page(IdGenerator.uuid, "My Private page 2", "", "/site/private/myprivatepage2", Seq(Admin, Writer), Seq(), widgetsPrivate)
  val privatePage = Page(IdGenerator.uuid, "Private root", "", "/site/private", Seq(Admin, Writer), Seq(privatePage1, privatePage2), widgetsRoot)

  val publicPage1 = Page(IdGenerator.uuid, "My public page 1", "", "/site/public/mypage1", Seq(Anonymous, Admin, Writer), Seq(), wigetsPublic)
  val publicPage2 = Page(IdGenerator.uuid, "My public page 2", "", "/site/public/mypage2", Seq(Anonymous, Admin, Writer), Seq(), wigetsPublic)
  val publicPage = Page(IdGenerator.uuid, "Public root", "", "/site/public", Seq(Anonymous, Admin, Writer), Seq(publicPage1, publicPage2), widgetsRoot)

  val index = Page(IdGenerator.uuid, "Welcome to 'The portal'", "The best portal ever ...", "/", Seq(Anonymous, Admin, Writer), Seq(privatePage), widgetsIndex)

  def findByUrl(url: String): Option[Page] = {  // For POC purpose only
    url match {
      case "/" => Some(index)
      case "/site/private" => Some(privatePage)
      case "/site/private/myprivatepage1" => Some(privatePage1)
      case "/site/private/myprivatepage2" => Some(privatePage2)
      case "/site/public" => Some(privatePage)
      case "/site/public/mypage1" => Some(publicPage1)
      case "/site/public/mypage2" => Some(publicPage2)
      case _ => None
    }
  }

  def pages(user: User): Seq[Page] = { // For POC purpose only
    user.roles match {
      case Anonymous :: Nil => Seq(index, publicPage, publicPage1, publicPage2)
      case _ => Seq(index, publicPage, publicPage1, publicPage2, privatePage, privatePage1, privatePage2)
    }
  }

  def directSubPages(user: User, from: Page): Seq[Page] = {  // For POC purpose only
    user.roles match {
      case _ if from.id == publicPage.id => Seq(publicPage1, publicPage2)
      case Anonymous :: Nil if from.id == index.id => Seq(publicPage)
      case _                if from.id == index.id => Seq(publicPage, privatePage)
      case _                if from.id == privatePage.id => Seq(privatePage1, privatePage2)
      case _  => Seq()
    }
  }

  def subPages(user: User, from: Page): Seq[Page] = {  // For POC purpose only
    user.roles match {
      case _ if from.id == publicPage.id => Seq(publicPage1, publicPage2)
      case Anonymous :: Nil if from.id == index.id => Seq(publicPage, publicPage1, publicPage2)
      case _                if from.id == index.id => Seq(publicPage, publicPage1, publicPage2, privatePage, privatePage1, privatePage2)
      case _                if from.id == privatePage.id => Seq(privatePage1, privatePage2)
      case _  => Seq()
    }
  }
}