name := """portal"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.1"

resolvers += "Sonatype Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots/"

libraryDependencies ++= Seq(
  cache,
  ws,
  "commons-codec" % "commons-codec" % "1.9",
  "org.reactivemongo" %% "play2-reactivemongo" % "0.10.5.0.akka23"
)
