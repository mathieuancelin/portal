package modules.structure

import modules.identity.Role
import play.api.libs.json._

trait Position
case object Left extends Position
case object Right extends Position
case object Center extends Position

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
  implicit val positionFmt = new Format[Position] {
    override def writes(o: Position): JsValue = o match {
      case Left => JsString("Left")
      case Right => JsString("Right")
      case Center => JsString("Center")
    }
    override def reads(json: JsValue): JsResult[Position] = json match {
      case JsString("Left") => JsSuccess(Left)
      case JsString("Right") => JsSuccess(Right)
      case JsString("Center") => JsSuccess(Center)
      case _ => JsError()
    }
  }
}

object MasheteInstance {
  implicit val masheteFmt = Json.format[MasheteInstance]
}

object Page {
  implicit val pageFmt = Json.format[Page]
}