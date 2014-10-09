package modules.structure

import java.nio.charset.Charset

import com.google.common.io.Files
import modules.identity.User
import play.api.libs.json.{Json, Reads}

import scala.concurrent.{ExecutionContext, Future}

object MashetesStore {

  private[this] lazy val mashetes = Json.parse(Files.toString(play.api.Play.current.getFile("conf/data/mashetes.json"), Charset.forName("UTF-8"))).as(Reads.seq(Mashete.masheteFmt))

  def findAll(): Future[Seq[Mashete]] = Future.successful(mashetes)
}

object PagesStore {

  lazy val pages: Seq[Page] = Json.parse(Files.toString(play.api.Play.current.getFile("conf/data/portal.json"), Charset.forName("UTF-8"))).as(Reads.seq(Page.pageFmt))

  def findByUrl(url: String)(implicit ec: ExecutionContext): Future[Option[Page]] = Future.successful(pages.find(p => p.url == url))

  def findById(id: String)(implicit ec: ExecutionContext): Future[Option[Page]] = Future.successful(pages.find(p => p.id == id))

  def pages(user: User)(implicit ec: ExecutionContext): Future[Seq[Page]] = Future.successful(pages.filter(p => p.accessibleByIds.intersect(user.roles).size > 0))
  def pages(from: Page, user: User)(implicit ec: ExecutionContext): Future[Seq[Page]] = {
    Future.successful(pages.filter(p => p.url.startsWith(from.url)))
  }

  def directSubPages(user: User, from: Page)(implicit ec: ExecutionContext): Future[Seq[Page]] = {
    from.subPages.map(_.filter(_.accessibleByIds.intersect(user.roles).size > 0))
  }

  def subPages(user: User, from: String)(implicit ec: ExecutionContext): Future[Seq[Page]] = {
    findById(from).flatMap {
      case Some(page) => page.subPages.flatMap(c => Future.sequence(c.map(p => pages(p, user))).map(_.flatten))
      case _ => Future.successful(Seq())
    }
  }
}