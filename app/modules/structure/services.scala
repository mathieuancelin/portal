package modules.structure

import java.nio.charset.Charset

import com.google.common.io.Files
import modules.identity.User
import play.api.libs.json.{Json, Reads}

object MashetesStore {

  private[this] lazy val mashetes = Json.parse(Files.toString(play.api.Play.current.getFile("conf/data/mashetes.json"), Charset.forName("UTF-8"))).as(Reads.seq(Mashete.masheteFmt))

  def findAll(): Seq[Mashete] = mashetes
}

object PagesStore {

  lazy val root = Json.parse(Files.toString(play.api.Play.current.getFile("conf/data/portal.json"), Charset.forName("UTF-8"))).as(Page.pageFmt)

  def findByUrl(url: String): Option[Page] = findBy(root, { p => p.url }, url)

  def findById(id: String): Option[Page] = findBy(root, { p => p.id }, id)

  private[this] def findBy(page: Page, extractor: (Page) => String, what: String): Option[Page] = {
    what match {
      case _ if extractor(page) == what => Some(page)
      case _ if extractor(page) != what && page.subPages.nonEmpty => page.subPages.map(findBy(_, extractor, what)).find(_.isDefined).flatten
      case _ if extractor(page) != what && page.subPages.isEmpty => None
      case _ => None
    }
  }

  def pages(user: User): Seq[Page] = pages(root, user, Seq())

  private[this] def pages(page: Page, user: User, ps: Seq[Page]): Seq[Page] = {
    val result = page match {
      case _ if page.accessibleByRoles.intersect(user.actualRoles).size > 0 && page.subPages.nonEmpty => page.subPages.map(pages(_, user, ps :+ page)).flatten
      case _ if page.accessibleByRoles.intersect(user.actualRoles).size > 0 && page.subPages.isEmpty => ps :+ page
      case _ if page.accessibleByRoles.intersect(user.actualRoles).size == 0 && page.subPages.nonEmpty => page.subPages.map(pages(_, user, ps)).flatten
      case _ if page.accessibleByRoles.intersect(user.actualRoles).size == 0 && page.subPages.isEmpty => ps
      case _ => Seq()
    }
    result.toSet.toSeq
  }

  def directSubPages(user: User, from: Page): Seq[Page] = {
    from.subPages.filter(_.accessibleBy.intersect(user.roles).size > 0)
  }

  def subPages(user: User, from: String): Seq[Page] = {
    findById(from) match {
      case Some(page) => {
        val ps = page.subPages.map(pages(_, user, Seq())).flatten
        println(ps)
        ps
      }
      case _ => Seq()
    }
  }
}