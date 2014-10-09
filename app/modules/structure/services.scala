package modules.structure

import java.nio.charset.Charset

import com.google.common.io.Files
import modules.identity.User
import play.api.libs.json.{Json, Reads}

import scala.concurrent.Future
import play.api.libs.concurrent.Execution.Implicits.defaultContext

object MashetesStore {

  private[this] lazy val mashetes = Json.parse(Files.toString(play.api.Play.current.getFile("conf/data/mashetes.json"), Charset.forName("UTF-8"))).as(Reads.seq(Mashete.masheteFmt))

  def findAll(): Future[Seq[Mashete]] = Future.successful(mashetes)
}

object PagesStore {

  lazy val root = Json.parse(Files.toString(play.api.Play.current.getFile("conf/data/portal.json"), Charset.forName("UTF-8"))).as(Page.pageFmt)

  def findByUrl(url: String): Future[Option[Page]] = Future.successful(findBy(root, { p => p.url }, url))

  def findById(id: String): Future[Option[Page]] = Future.successful(findBy(root, { p => p.id }, id))

  private[this] def findBy(page: Page, extractor: (Page) => String, what: String): Option[Page] = {
    what match {
      case _ if extractor(page) == what => Some(page)
      case _ if extractor(page) != what && page.subPages.nonEmpty => page.subPages.map(findBy(_, extractor, what)).find(_.isDefined).flatten
      case _ if extractor(page) != what && page.subPages.isEmpty => None
      case _ => None
    }
  }

  def pages(user: User): Future[Seq[Page]] = Future.successful(pages(root, user, Seq()))

  private[this] def pages(page: Page, user: User, ps: Seq[Page]): Seq[Page] = {
    val result = page match {
      case _ if page.accessibleBy.intersect(user.roles).size > 0 && page.subPages.nonEmpty => page.subPages.map(pages(_, user, ps :+ page)).flatten
      case _ if page.accessibleBy.intersect(user.roles).size > 0 && page.subPages.isEmpty => ps :+ page
      case _ if page.accessibleBy.intersect(user.roles).size == 0 && page.subPages.nonEmpty => page.subPages.map(pages(_, user, ps)).flatten
      case _ if page.accessibleBy.intersect(user.roles).size == 0 && page.subPages.isEmpty => ps
      case _ => Seq()
    }
    result.toSet.toSeq
  }

  def directSubPages(user: User, from: Page): Future[Seq[Page]] = {
    Future.successful(from.subPages.filter(_.accessibleBy.intersect(user.roles).size > 0))
  }

  def subPages(user: User, from: String): Future[Seq[Page]] = {
    findById(from).map {
      case Some(page) => page.subPages.map(pages(_, user, Seq())).flatten
      case _ => Seq()
    }
  }
}