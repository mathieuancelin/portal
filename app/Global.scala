import akka.actor.Props
import modules.data.{ElasticSearchClientActor, ElasticsearchClient}
import play.api.libs.concurrent.Akka
import play.api.{Application, GlobalSettings}

object Global extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    //Akka.system(app).actorOf(
    //  Props(classOf[ElasticSearchClientActor],
    //    ElasticsearchClient.actorName,
    //    ElasticsearchClient.esUrl,
    //    ElasticsearchClient.wsTimeout.duration.toMillis
    //  ),
    //  ElasticsearchClient.actorName
    //)
  }
}
