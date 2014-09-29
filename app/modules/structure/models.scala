package modules.structure

import modules.identity.Role
import play.api.libs.json._

case class Position(column: Int, line: Int)

case class Mashete(id: String, name: String, description: String, url: Option[String], instanciate: String)

case class MasheteInstance(id: String, masheteId: String, position: Position, instanceConfig: JsObject)

case class Page(id: String, name: String, description: String, url: String, accessibleBy: Seq[Role], subPages: Seq[Page], mashetes: Seq[MasheteInstance]) {
  def toJson = Page.pageFmt.writes(this)
  def toJsonString = Json.stringify(toJson)
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
  implicit val pageFmt = Json.format[Page]
}