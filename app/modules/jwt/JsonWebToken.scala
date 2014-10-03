package modules.jwt

import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

import org.apache.commons.codec.binary.Base64
import play.api.libs.json.{JsObject, Json}

import scala.util.Try

case class JsonWebToken(header: JsObject, claims: JsObject) {

  def encrypt(key: String): Try[String] = {
    Try {
        val algo = (header \ "alg").as[String]
        val tokenType = (header \ "typ").as[String]
        val encodedHeader = Base64.encodeBase64URLSafeString(Json.stringify(header).getBytes("UTF-8"))
        val encodedClaims = Base64.encodeBase64URLSafeString(Json.stringify(claims).getBytes("UTF-8"))
        val data = s"$encodedHeader.$encodedClaims"
        val bytes = algo match {
          case "HS256" => build("HmacSHA256", data, key)
          case "HS384" => build("HmacSHA256", data, key)
          case "HS512" => build("HmacSHA256", data, key)
          case "none" => Array.empty[Byte]
          case a => throw new RuntimeException(s"Unknown algorithm $a")
        }
        val signature = Base64.encodeBase64URLSafeString(bytes)
        s"$data.$signature"
      }
  }

  private[this] def build(algorithm: String, data: String, key: String): Array[Byte] = {
    val mac: Mac = Mac.getInstance(algorithm)
    val secretKey: SecretKeySpec = new SecretKeySpec(key.getBytes, algorithm)
    mac.init(secretKey)
    mac.doFinal(data.getBytes)
  }
}

object JsonWebToken {

  val defaultHeader = Json.obj("typ" -> "JWT", "alg" -> "HS256")

  def apply(claims: JsObject): JsonWebToken = JsonWebToken(defaultHeader, claims)

  def apply(jwt: String): Option[JsonWebToken] = {
    val sections = jwt.split("\\.")
    if (sections.length == 3) {
      val header = Json.parse(new String(Base64.decodeBase64(sections(0)), "UTF-8")).as[JsObject]
      val claims = Json.parse(new String(Base64.decodeBase64(sections(1)), "UTF-8")).as[JsObject]
      Some(JsonWebToken(header, claims))
    } else {
      None
    }
  }

  def validate(jwt: String, key: String): Boolean = {
    val sections = jwt.split("\\.")
    if (sections.length != 3) {
      false
    } else {
      val header = Json.parse(new String(Base64.decodeBase64(sections(0)), "UTF-8")).as[JsObject]
      val claims = Json.parse(new String(Base64.decodeBase64(sections(1)), "UTF-8")).as[JsObject]
      val signature = sections(2)
      val computedSignature = JsonWebToken(header, claims).encrypt(key).toOption.getOrElse("WRONG!!")
      computedSignature.endsWith(signature)
    }
  }
}
