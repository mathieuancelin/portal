package modules.communication

import play.api.libs.json.JsObject

case class BroadcastMessage(channel: String, payload: JsObject) {

}

case class UnicastMessage(userId: String, channel: String, payload: JsObject) {

}
