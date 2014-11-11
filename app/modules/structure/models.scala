package modules.structure

import java.util.concurrent.TimeUnit

import modules.Env
import modules.identity.{Role, User}
import play.api.libs.Codecs
import play.api.libs.json._

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext, Future}

case class Position(column: Int, line: Int)

case class Mashete(_id: String, name: String, description: String, url: String, defaultParam: JsObject)

case class MasheteInstance(id: String, masheteId: String, position: Position, instanceConfig: JsObject) {
  def toJson = MasheteInstance.masheteFmt.writes(this)
  def toJsonString = Json.stringify(toJson)
}

case class Page(
                 _id: String,
                 name: String,
                 description: String,
                 url: String,      // TODO : add CSS urls
                 accessibleByIds: Seq[String],
                 subPageIds: Seq[String],
                 mashetes: Seq[MasheteInstance],
                 colSizes: Seq[Int] = Seq(6, 6)
       ) {

  def subPages(implicit ec: ExecutionContext): Future[Seq[Page]] = Future.sequence(subPageIds.map(Env.pageStore.findById)).map(_.collect { case Some(role) => role })
  def accessibleByRoles(implicit ec: ExecutionContext): Future[Seq[Role]] = Future.sequence(accessibleByIds.map(Env.roleStore.findById).map(_.collect { case Some(role) => role }))
  def toJson = Page.pageFmt.writes(this)
  def toJsonString = Json.stringify(toJson)
  def toHtml(user: User): String = {
    import play.api.libs.concurrent.Execution.Implicits.defaultContext
    if (subPageIds.nonEmpty) {
      s"""<li class="dropdown">
        <a href="$url" class="dropdown-toggle" data-toggle="dropdown">$name<span class="caret"></span></a>
          <ul class="dropdown-menu" role="menu">""" +
            // TODO : arrrrrggghhhhhh !!!!
            Await.result(subPages, Duration(5, TimeUnit.SECONDS)).filter(p => p.accessibleByIds.intersect(user.roles).size > 0).map(_.toHtml(user)).mkString("") + "</ul></li>"
    } else {
      s"""<li><a href="$url">$name</a></li>"""
    }
  }
}

object Mashete {
  implicit val masheteFmt = Json.format[Mashete]
}

object Position {
  implicit val positionFmt = Json.format[Position]
}

object MasheteInstance {
  implicit val masheteFmt = Json.format[MasheteInstance]
}

object Page {
  private[this] val actualPageFormater = Json.format[Page]
  private[this] val writerPlusHash = Json.writes[Page].transform(jsv => jsv.as[JsObject] ++ Json.obj("url_hash" -> Codecs.md5((jsv \ "url").as[String].getBytes)))
  implicit val pageFmt: Format[Page] = new Format[Page] {
    override def reads(json: JsValue): JsResult[Page] = actualPageFormater.reads(json)
    override def writes(o: Page): JsValue = writerPlusHash.writes(o)
  }
}