package modules.structure

import common.IdGenerator
import modules.identity.{Admin, Anonymous, User, Writer}
import play.api.libs.json.Json


object MashetesStore {

    def findAll(): Seq[Mashete] = {
      Seq(
        Mashete("TitleMashete", "Title Mashete", "Display title and description of the current page", "${ASSET}/javascripts/mashetes/build/title.js", Json.obj("title" -> "Page description")),
        Mashete("LinksMashete", "Links Mashete", "Display links to follow from the current page", "${ASSET}/javascripts/mashetes/build/links.js", Json.obj()),
        Mashete("MarkdownMashete", "Markdown Mashete", "Display markdown formatted content", "${ASSET}/javascripts/mashetes/build/markdown.js", Json.obj("title" -> "Mardown display", "markdown" -> "VGhpcyBpcyB5b3VyIG5ldyBQbGF5IGFwcGxpY2F0aW9uDQo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0NCg0KVGhpcyBmaWxlIHdpbGwgYmUgcGFja2FnZWQgd2l0aCB5b3VyIGFwcGxpY2F0aW9uLCB3aGVuIHVzaW5nIGBhY3RpdmF0b3IgZGlzdGAuDQo=")),
        Mashete("IframeMashete", "Iframe Mashete", "Display content from another address", "${ASSET}/javascripts/mashetes/build/iframe.js", Json.obj("url" -> "http://fr.m.wikipedia.org/", "title" -> "Wikipedia", "height" -> 400))
      )
    }
}

object PagesStore {

  val widgetsRoot = Seq(
    MasheteInstance("widget-2", "LinksMashete", Position(0, 0), Json.obj())
  )

  val widgetsIndex = Seq(
    MasheteInstance("widget-1", "TitleMashete", Position(0, 0), Json.obj("title" -> "Page description")),
    MasheteInstance("widget-2", "LinksMashete", Position(0, 1), Json.obj()),
    MasheteInstance("widget-2", "MarkdownMashete", Position(0, 2), Json.obj("title" -> "Mardown display", "markdown" -> "IyBDYWVsbyBvcmlzIGRpcmEgc3VvcXVlIGNhcHV0IHJlbGV2YXJlIGNvbnRyYXhpdA0KDQojIyBRdWFsZSB2YXRpY2luYXR1cyBuaWR1bSBzb3JvcmVtIGV0IGFkaWl0DQoNCkxvcmVtIG1hcmtkb3dudW0gZmlicmFzLCBxdWVtIGluIGVzdCBwcm9jdXJydW50IGFyY2FuaXMgcHJvY3VsIHVuYSBDYWRtZSB2ZW5lbmkNCmluIGRlY2xpbmF0LiBMYWJlZmFjdGFxdWUgcG9zdWl0IGFubm9zIHZpcmlidXMgcXVhIHVuZGlzIGxvbmdpdXMgdm9zLCBwYXRlcnF1ZQ0KY2FyZW50aWEgZGljdG9zIExldWNvdGhvZSBjdXJydSBpbnF1YW0gdHJheGVyZSBwZWN0b3JlLiBDb2VyY2ViYXQgaXBzZSBhcnR1cw0KVGhlYmFzIHF1b3MsIGFsaW9zIGFybWEgcGxlYmUgbWUgZ3VsYWUgdm9sdWNyaXMuIEV1ZW5pbmFlIHF1b3F1ZSBlc3NlIHNvbGl0byBldA0KdmlkaSBub3ZpcyBkZXNlcnVpdDogcHV0YXJlcy4gVmlkaXQgdGFudG8gaWduaXMgbmVjIGNvbml1bnggbHVtaW5hLCB0YW1lbiBmZWNpdA0KYmlwZW5uaWZlcnVtcXVlIGRlY29ydW0gc2Nyb2JlIHV0IG9jdG9uaXMgbm9uIHN1bW1vLg0KDQoxLiBDYXVzYSBhbW9yZSBiaXMgZXQgaXViZSBmbGV4ZXJlIHVyaXR1cg0KMi4gSGFiZXQgcGVkZSBzdXN0aW51aXNzZSBvcGFjYXMgaW4gcXVvIGRlYmVyaQ0KMy4gTmVjIGRlc3BlY3RhYmF0IHF1aWQgZXQgbW9ydGUgdGFjaXRvDQo0LiBUdW0gaWduZSBpbiBtYXJtb3JlIHBlbGFnbyBkZXRlc3RhdHVyIGhhYw0KNS4gU29sYSBtb3ZpdCBlYSB2ZWxhIHJlcyBmdXJvcmlzIHBhc2NpDQoNClBvc2l0YSBpbiBwaWV0YXRpcyBxdW9zLCBpdXZlbmVtLCB0ZXJyYXMgZXQgZm9yc2l0YW4gZGV1cyBTY3l0aGljaXMsIGVzdCBpbg0KbWFnbm8/IFN0eXBoZWx1bXF1ZSBpbmRlLCBIaXBwb2x5dHVtIGNhbmFlcXVlIFJob2RvcGUgaW50YWN0YSByZXJ1bSBHb3JnZW5xdWUNCnZvY2VtLCBwcmltdXMgaWxsZSB2ZW50aXMgb2JzdGFudGlhIHZlbG9jaW9yIGR1cmUuIFJhcHRhIG51cnVzIGRpY3RpcyBhbmltYW0NCmxhbmd1ZXJlIGNvbml1Z2lzIHZldGVyaXMsIHR1bWlkYSwgY29ubGFwc2FtcXVlPw0KDQojIyBIaW5jIHRhYmVsbGFzIENhc3Npb3BlDQoNCk1vcnRpIHZpcmd1bHRpcyBvc3NpYnVzIG51bmMgcGFydGUgcXVpY3F1YW0sIGJvdW1xdWUgc2ltdWxhYywgbWloaSBxdW8gcGxhY2VzDQpjb3Jwb3JhIG5hdHVyYS4gUGFyYXJldCBjcnVkZWxpcyBsdXggbWFyZSwgb21uZSB0YW50aSBjYWVzcGl0ZSwgaW4gYWNlcnJpcy4NCkRlcG9zaXR1cmEgKip2ZXJzdXMgc2lnbmEgY29udGluZ2VyZSoqIGFncm9zOiBkdWFzIHF1YWUgc2FuZ3VpbmUgYXRxdWUuIEZlcm94cXVlDQpmcnVzdHJhIGRpc2N1c3NhIG11dGFudHVyIGFkc3BpY2l1bnQgdm9iaXMgKipwcmFlY2VwdGEgdHVyaXMgbWFsaXMqKiBhbmltby4NCg0KKipGYXVjaWJ1cyByZXNlcnZhbnQgaW1pcyoqLiBCaW5hIFRyb2lhZSwgaGFlcmViYXQgZGVjaXBpZXQgY3VscGFlLCBjb3Jwb3JhIGR1cmENCmN1bSBjcnVlbnR1bSBtaWxpdGUsIGJhY2lzIGZvcmVzLiBNZWEgZmFjdHVzLCBhcnNpdCwgZXQgc29sZSwgb3JlIFtpYWN0YW50ZW0NCmRldm9yYXRdKGh0dHA6Ly9oYXNrZWxsLm9yZy8pIQ0KDQojIyBWZWx1dGkgaW5xdWl0IGx1Y2lzDQoNCkZlcmlub3MgZnJvbmRlc3F1ZSB2aXZ1bSwgaWduaXMgW3BldGUgYW5pbWF0YQ0KY3Vyc3VxdWVdKGh0dHA6Ly90ZXh0ZnJvbWRvZy50dW1ibHIuY29tLykgbm9uLCB1dGVyb3F1ZSBkZXNpZXJhdC4NCltIeXBhZXBpc10oaHR0cDovL3N0b25lc2hpcC5vcmcvKSBtZSBmZXJlPw0KDQogICAgaWYgKHVuaWNvZGVfaHR0cHMgPCBpbnRlcmxhY2VkU21tLnRhZ19kdWFsKG5hdGl2ZVRoaWNrQm90bmV0IC0gaHViKSkgew0KICAgICAgICBtYWlsICs9IGZhdmljb247DQogICAgICAgIG1vZGVfYWxlcnQgPSAzNTA3NjY7DQogICAgICAgIGNwY19pcGFkX3FiZSAvPSBlcHNfZGVza3RvcF9jb21waWxlKDk4NDA3LCBkaWdpdGFsU2hvcnRjdXQpOw0KICAgIH0NCiAgICB2YXIgaGFyZF9vcGVyYXRpb24gPSBpY3RDb21tZXJjaWFsRGlhbChwYWdlVm9sdW1lTGF0ZW5jeSh3ZGRtVGFibGV0LA0KICAgICAgICAgICAgaG9uZXlwb3RfcmVhbCwgMyksIC0zICsgZXNwb3J0c0ZpbGUubWVtb3J5X3dpcmVsZXNzKA0KICAgICAgICAgICAgcmVtb3RlX2ZyYW1ld29ya19tcGVnLCBtZWRpYV9jaGFyYWN0ZXJfc3VibmV0LCBtYWlsQ2NDYXBhY2l0eSksDQogICAgICAgICAgICBzZWFyY2hTY2FuKTsNCiAgICBmaXJtd2FyZV9yZWR1bmRhbmN5X3R1dG9yaWFsLm1vZGlmaWVySGZzVmlldyArPSA1ICogMTAgKiBlbmRIYXJkZW5pbmcgKw0KICAgICAgICAgICAgd2FybUJhcjsNCiAgICB3aGl0ZWxpc3RQcmV0ZXN0IC09IGluc3RhbGxlcih3aW1heF9zY2FuICsgcmFtX2ZsYXQgKiAtMywgY2xpZW50RHNsRGlnaXRhbCk7DQogICAgb3ZlcmNsb2NraW5nX2Zhdmljb25fbG9zc3kuc3dpdGNoICs9IGJvb3QoY29tcGlsZXIpOw0KDQpBcXVhIHVsbHVtIGh1bmMgdmVuaWV0IHByb2N1bCBpbGxhIGZvZGllbnRpYnVzIGNvbWVzIGZvbnRpIGNvcm5lYXF1ZSBzdWJpdGlzLA0Kdml4IHNhZXBlIG9tZW4gcGVydmVuaXQuIERlbmlxdWUgZXQgZG9uZWMgYWV0aGVyYSBoZXUgcmVjbHVkaXQgbm9zdHJhIG1vdGFxdWUNCmNhbmF0IHF1YWVzaXR1cyBxdW9kIG5pbCwgaGF1dCB1bmRhcyBxdW9xdWUgcmVsZXZhcmUgc2VxdXVudHVyPyBWaWRpdCBkZWFtDQp0YW5kZW06IGV2ZW5pdW50IGRpc2NlZGl0ZSB2ZXRhcmlzOiBkaXhpdCBwYXJzIGFtcGxpdXMgbWluaXMgZmx1ZXJlLiBTdXN0aW51ZXJlDQoqKnJpZ2lkbyoqLiBWZXJzYXR1cyAqKmZ1dHVyYSoqOyB0b3Qgc3BhdGlpIG11dGF2ZXJhdCB2aWRpdDsgc3ViZXN0IHZlcmJpcyBjYXVzYQ0KQWVuZWFlIGlucHVuZT8NCg0KVGVsYW1vbiBuZWMgTGVuaXMgW3RyaXBsaWNpIHRpYmldKGh0dHA6Ly9oZWVlZWVlZWV5LmNvbS8pIHRlcnJhIGluIGV1bnRxdWUNCkhlY3RvciBmYWNpbnVzIHByb2dlbmllcyBEaXRlICpub21lbiohIE9yc2EgZG9sb3IsIGl1bmN0dXJhcyBbY3VycnUNCmlucGV0dXNdKGh0dHA6Ly9pbWd1ci5jb20vKSBkZWEgaG9zcGVzIHByYWVjb250cmVjdGF0cXVlIHBvcnRhbnMgZGV4dGVyaW9yPw0KUHV0ZXQgKipwaGFyZXRyYXMgZGl4aXQqKiB0ZW1wb3JhIG1hbmViYXQgU3RoZW5lbGVpdXMsIGhlcmJpcywgZXQgcGF0aXR1ci4gU3VudA0KKm9yYSBzb2xlbnQqLCBlcmFzIGxhcHN1cywgdGVycmV0IGNvbnN0aXRlcmF0IGZ1ZXJhdCBjcmVhdGkuIFZvdGEgbW9lbmlhIGZlcnJvDQpzZW5pbGVtIHRlZ3VtZW5xdWUgKiphcnNpdCoqIGluIGZhdGlkaWN1cyB0b3RvIQ0KDQpbSHlwYWVwaXNdOiBodHRwOi8vc3RvbmVzaGlwLm9yZy8NCltjdXJydSBpbnBldHVzXTogaHR0cDovL2ltZ3VyLmNvbS8NCltpYWN0YW50ZW0gZGV2b3JhdF06IGh0dHA6Ly9oYXNrZWxsLm9yZy8NCltwZXRlIGFuaW1hdGEgY3Vyc3VxdWVdOiBodHRwOi8vdGV4dGZyb21kb2cudHVtYmxyLmNvbS8NClt0cmlwbGljaSB0aWJpXTogaHR0cDovL2hlZWVlZWVlZXkuY29tLw==")),
    MasheteInstance("widget-3", "IframeMashete", Position(1, 0), Json.obj("url" -> "https://www.playframework.com/", "title" -> "Playframework", "height" -> 600))
  )

  val wigetsPublic = Seq(
    MasheteInstance("widget-1", "TitleMashete", Position(0, 0), Json.obj("title" -> "Page description")),
    MasheteInstance("widget-2", "MarkdownMashete", Position(1, 0), Json.obj("title" -> "Mardown display", "markdown" -> "IyBDYWVsbyBvcmlzIGRpcmEgc3VvcXVlIGNhcHV0IHJlbGV2YXJlIGNvbnRyYXhpdA0KDQojIyBRdWFsZSB2YXRpY2luYXR1cyBuaWR1bSBzb3JvcmVtIGV0IGFkaWl0DQoNCkxvcmVtIG1hcmtkb3dudW0gZmlicmFzLCBxdWVtIGluIGVzdCBwcm9jdXJydW50IGFyY2FuaXMgcHJvY3VsIHVuYSBDYWRtZSB2ZW5lbmkNCmluIGRlY2xpbmF0LiBMYWJlZmFjdGFxdWUgcG9zdWl0IGFubm9zIHZpcmlidXMgcXVhIHVuZGlzIGxvbmdpdXMgdm9zLCBwYXRlcnF1ZQ0KY2FyZW50aWEgZGljdG9zIExldWNvdGhvZSBjdXJydSBpbnF1YW0gdHJheGVyZSBwZWN0b3JlLiBDb2VyY2ViYXQgaXBzZSBhcnR1cw0KVGhlYmFzIHF1b3MsIGFsaW9zIGFybWEgcGxlYmUgbWUgZ3VsYWUgdm9sdWNyaXMuIEV1ZW5pbmFlIHF1b3F1ZSBlc3NlIHNvbGl0byBldA0KdmlkaSBub3ZpcyBkZXNlcnVpdDogcHV0YXJlcy4gVmlkaXQgdGFudG8gaWduaXMgbmVjIGNvbml1bnggbHVtaW5hLCB0YW1lbiBmZWNpdA0KYmlwZW5uaWZlcnVtcXVlIGRlY29ydW0gc2Nyb2JlIHV0IG9jdG9uaXMgbm9uIHN1bW1vLg0KDQoxLiBDYXVzYSBhbW9yZSBiaXMgZXQgaXViZSBmbGV4ZXJlIHVyaXR1cg0KMi4gSGFiZXQgcGVkZSBzdXN0aW51aXNzZSBvcGFjYXMgaW4gcXVvIGRlYmVyaQ0KMy4gTmVjIGRlc3BlY3RhYmF0IHF1aWQgZXQgbW9ydGUgdGFjaXRvDQo0LiBUdW0gaWduZSBpbiBtYXJtb3JlIHBlbGFnbyBkZXRlc3RhdHVyIGhhYw0KNS4gU29sYSBtb3ZpdCBlYSB2ZWxhIHJlcyBmdXJvcmlzIHBhc2NpDQoNClBvc2l0YSBpbiBwaWV0YXRpcyBxdW9zLCBpdXZlbmVtLCB0ZXJyYXMgZXQgZm9yc2l0YW4gZGV1cyBTY3l0aGljaXMsIGVzdCBpbg0KbWFnbm8/IFN0eXBoZWx1bXF1ZSBpbmRlLCBIaXBwb2x5dHVtIGNhbmFlcXVlIFJob2RvcGUgaW50YWN0YSByZXJ1bSBHb3JnZW5xdWUNCnZvY2VtLCBwcmltdXMgaWxsZSB2ZW50aXMgb2JzdGFudGlhIHZlbG9jaW9yIGR1cmUuIFJhcHRhIG51cnVzIGRpY3RpcyBhbmltYW0NCmxhbmd1ZXJlIGNvbml1Z2lzIHZldGVyaXMsIHR1bWlkYSwgY29ubGFwc2FtcXVlPw0KDQojIyBIaW5jIHRhYmVsbGFzIENhc3Npb3BlDQoNCk1vcnRpIHZpcmd1bHRpcyBvc3NpYnVzIG51bmMgcGFydGUgcXVpY3F1YW0sIGJvdW1xdWUgc2ltdWxhYywgbWloaSBxdW8gcGxhY2VzDQpjb3Jwb3JhIG5hdHVyYS4gUGFyYXJldCBjcnVkZWxpcyBsdXggbWFyZSwgb21uZSB0YW50aSBjYWVzcGl0ZSwgaW4gYWNlcnJpcy4NCkRlcG9zaXR1cmEgKip2ZXJzdXMgc2lnbmEgY29udGluZ2VyZSoqIGFncm9zOiBkdWFzIHF1YWUgc2FuZ3VpbmUgYXRxdWUuIEZlcm94cXVlDQpmcnVzdHJhIGRpc2N1c3NhIG11dGFudHVyIGFkc3BpY2l1bnQgdm9iaXMgKipwcmFlY2VwdGEgdHVyaXMgbWFsaXMqKiBhbmltby4NCg0KKipGYXVjaWJ1cyByZXNlcnZhbnQgaW1pcyoqLiBCaW5hIFRyb2lhZSwgaGFlcmViYXQgZGVjaXBpZXQgY3VscGFlLCBjb3Jwb3JhIGR1cmENCmN1bSBjcnVlbnR1bSBtaWxpdGUsIGJhY2lzIGZvcmVzLiBNZWEgZmFjdHVzLCBhcnNpdCwgZXQgc29sZSwgb3JlIFtpYWN0YW50ZW0NCmRldm9yYXRdKGh0dHA6Ly9oYXNrZWxsLm9yZy8pIQ0KDQojIyBWZWx1dGkgaW5xdWl0IGx1Y2lzDQoNCkZlcmlub3MgZnJvbmRlc3F1ZSB2aXZ1bSwgaWduaXMgW3BldGUgYW5pbWF0YQ0KY3Vyc3VxdWVdKGh0dHA6Ly90ZXh0ZnJvbWRvZy50dW1ibHIuY29tLykgbm9uLCB1dGVyb3F1ZSBkZXNpZXJhdC4NCltIeXBhZXBpc10oaHR0cDovL3N0b25lc2hpcC5vcmcvKSBtZSBmZXJlPw0KDQogICAgaWYgKHVuaWNvZGVfaHR0cHMgPCBpbnRlcmxhY2VkU21tLnRhZ19kdWFsKG5hdGl2ZVRoaWNrQm90bmV0IC0gaHViKSkgew0KICAgICAgICBtYWlsICs9IGZhdmljb247DQogICAgICAgIG1vZGVfYWxlcnQgPSAzNTA3NjY7DQogICAgICAgIGNwY19pcGFkX3FiZSAvPSBlcHNfZGVza3RvcF9jb21waWxlKDk4NDA3LCBkaWdpdGFsU2hvcnRjdXQpOw0KICAgIH0NCiAgICB2YXIgaGFyZF9vcGVyYXRpb24gPSBpY3RDb21tZXJjaWFsRGlhbChwYWdlVm9sdW1lTGF0ZW5jeSh3ZGRtVGFibGV0LA0KICAgICAgICAgICAgaG9uZXlwb3RfcmVhbCwgMyksIC0zICsgZXNwb3J0c0ZpbGUubWVtb3J5X3dpcmVsZXNzKA0KICAgICAgICAgICAgcmVtb3RlX2ZyYW1ld29ya19tcGVnLCBtZWRpYV9jaGFyYWN0ZXJfc3VibmV0LCBtYWlsQ2NDYXBhY2l0eSksDQogICAgICAgICAgICBzZWFyY2hTY2FuKTsNCiAgICBmaXJtd2FyZV9yZWR1bmRhbmN5X3R1dG9yaWFsLm1vZGlmaWVySGZzVmlldyArPSA1ICogMTAgKiBlbmRIYXJkZW5pbmcgKw0KICAgICAgICAgICAgd2FybUJhcjsNCiAgICB3aGl0ZWxpc3RQcmV0ZXN0IC09IGluc3RhbGxlcih3aW1heF9zY2FuICsgcmFtX2ZsYXQgKiAtMywgY2xpZW50RHNsRGlnaXRhbCk7DQogICAgb3ZlcmNsb2NraW5nX2Zhdmljb25fbG9zc3kuc3dpdGNoICs9IGJvb3QoY29tcGlsZXIpOw0KDQpBcXVhIHVsbHVtIGh1bmMgdmVuaWV0IHByb2N1bCBpbGxhIGZvZGllbnRpYnVzIGNvbWVzIGZvbnRpIGNvcm5lYXF1ZSBzdWJpdGlzLA0Kdml4IHNhZXBlIG9tZW4gcGVydmVuaXQuIERlbmlxdWUgZXQgZG9uZWMgYWV0aGVyYSBoZXUgcmVjbHVkaXQgbm9zdHJhIG1vdGFxdWUNCmNhbmF0IHF1YWVzaXR1cyBxdW9kIG5pbCwgaGF1dCB1bmRhcyBxdW9xdWUgcmVsZXZhcmUgc2VxdXVudHVyPyBWaWRpdCBkZWFtDQp0YW5kZW06IGV2ZW5pdW50IGRpc2NlZGl0ZSB2ZXRhcmlzOiBkaXhpdCBwYXJzIGFtcGxpdXMgbWluaXMgZmx1ZXJlLiBTdXN0aW51ZXJlDQoqKnJpZ2lkbyoqLiBWZXJzYXR1cyAqKmZ1dHVyYSoqOyB0b3Qgc3BhdGlpIG11dGF2ZXJhdCB2aWRpdDsgc3ViZXN0IHZlcmJpcyBjYXVzYQ0KQWVuZWFlIGlucHVuZT8NCg0KVGVsYW1vbiBuZWMgTGVuaXMgW3RyaXBsaWNpIHRpYmldKGh0dHA6Ly9oZWVlZWVlZWV5LmNvbS8pIHRlcnJhIGluIGV1bnRxdWUNCkhlY3RvciBmYWNpbnVzIHByb2dlbmllcyBEaXRlICpub21lbiohIE9yc2EgZG9sb3IsIGl1bmN0dXJhcyBbY3VycnUNCmlucGV0dXNdKGh0dHA6Ly9pbWd1ci5jb20vKSBkZWEgaG9zcGVzIHByYWVjb250cmVjdGF0cXVlIHBvcnRhbnMgZGV4dGVyaW9yPw0KUHV0ZXQgKipwaGFyZXRyYXMgZGl4aXQqKiB0ZW1wb3JhIG1hbmViYXQgU3RoZW5lbGVpdXMsIGhlcmJpcywgZXQgcGF0aXR1ci4gU3VudA0KKm9yYSBzb2xlbnQqLCBlcmFzIGxhcHN1cywgdGVycmV0IGNvbnN0aXRlcmF0IGZ1ZXJhdCBjcmVhdGkuIFZvdGEgbW9lbmlhIGZlcnJvDQpzZW5pbGVtIHRlZ3VtZW5xdWUgKiphcnNpdCoqIGluIGZhdGlkaWN1cyB0b3RvIQ0KDQpbSHlwYWVwaXNdOiBodHRwOi8vc3RvbmVzaGlwLm9yZy8NCltjdXJydSBpbnBldHVzXTogaHR0cDovL2ltZ3VyLmNvbS8NCltpYWN0YW50ZW0gZGV2b3JhdF06IGh0dHA6Ly9oYXNrZWxsLm9yZy8NCltwZXRlIGFuaW1hdGEgY3Vyc3VxdWVdOiBodHRwOi8vdGV4dGZyb21kb2cudHVtYmxyLmNvbS8NClt0cmlwbGljaSB0aWJpXTogaHR0cDovL2hlZWVlZWVlZXkuY29tLw=="))
  )

  val widgetsPrivate = Seq(
    MasheteInstance("widget-1", "TitleMashete", Position(0, 0), Json.obj("title" -> "Page description")),
    MasheteInstance("widget-2", "LinksMashete", Position(0, 1), Json.obj()),
    MasheteInstance("widget-3", "IframeMashete", Position(1, 0), Json.obj("url" -> "http://underscorejs.org/", "title" -> "Underscore", "height" -> 600))
  )

  val privatePage1 = Page(IdGenerator.uuid, "My Private page 1", "", "/site/private/myprivatepage1", Seq(Admin, Writer), Seq(), widgetsPrivate, 3, 9)
  val privatePage2 = Page(IdGenerator.uuid, "My Private page 2", "", "/site/private/myprivatepage2", Seq(Admin, Writer), Seq(), widgetsPrivate, 8, 4)
  val privatePage = Page(IdGenerator.uuid, "Private root", "", "/site/private", Seq(Admin, Writer), Seq(privatePage1, privatePage2), widgetsRoot)

  val publicPage1 = Page(IdGenerator.uuid, "My public page 1", "", "/site/public/mypage1", Seq(Anonymous, Admin, Writer), Seq(), wigetsPublic)
  val publicPage2 = Page(IdGenerator.uuid, "My public page 2", "", "/site/public/mypage2", Seq(Anonymous, Admin, Writer), Seq(), wigetsPublic, 3, 9)
  val publicPage3 = Page(IdGenerator.uuid, "My public page 3", "", "/site/public/mypage3", Seq(Anonymous, Admin, Writer), Seq(), widgetsRoot, 12, 6)
  val publicPage = Page(IdGenerator.uuid, "Public root", "", "/site/public", Seq(Anonymous, Admin, Writer), Seq(publicPage1, publicPage2, publicPage3), widgetsRoot)

  val index = Page(IdGenerator.uuid, "Welcome to 'The portal'", "The best portal ever ...", "/", Seq(Anonymous, Admin, Writer), Seq(privatePage, publicPage), widgetsIndex)

  def findByUrl(url: String): Option[Page] = {  // For POC purpose only
    url match {
      case "/" => Some(index)
      case "/site/private" => Some(privatePage)
      case "/site/private/myprivatepage1" => Some(privatePage1)
      case "/site/private/myprivatepage2" => Some(privatePage2)
      case "/site/public" => Some(privatePage)
      case "/site/public/mypage1" => Some(publicPage1)
      case "/site/public/mypage2" => Some(publicPage2)
      case "/site/public/mypage3" => Some(publicPage3)
      case _ => None
    }
  }

  def pages(user: User): Seq[Page] = { // For POC purpose only
    user.roles match {
      case Anonymous :: Nil => Seq(index, publicPage, publicPage1, publicPage2, publicPage3)
      case _ => Seq(index, publicPage, publicPage1, publicPage2, publicPage3, privatePage, privatePage1, privatePage2)
    }
  }

  def directSubPages(user: User, from: Page): Seq[Page] = {  // For POC purpose only
    user.roles match {
      case _ if from.id == publicPage.id => Seq(publicPage1, publicPage2, publicPage3)
      case Anonymous :: Nil if from.id == index.id => Seq(publicPage)
      case _                if from.id == index.id => Seq(publicPage, privatePage)
      case _                if from.id == privatePage.id => Seq(privatePage1, privatePage2)
      case _  => Seq()
    }
  }

  def subPages(user: User, from: Page): Seq[Page] = {  // For POC purpose only
    user.roles match {
      case _ if from.id == publicPage.id => Seq(publicPage1, publicPage2, publicPage3)
      case Anonymous :: Nil if from.id == index.id => Seq(publicPage, publicPage1, publicPage2, publicPage3)
      case _                if from.id == index.id => Seq(publicPage, publicPage1, publicPage2, publicPage3, privatePage, privatePage1, privatePage2)
      case _                if from.id == privatePage.id => Seq(privatePage1, privatePage2)
      case _  => Seq()
    }
  }
}