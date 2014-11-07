portal = portal || {};

portal.Mashetes = require('./common/mashete');

portal.MashetesStore = portal.MashetesStore || {};

var React = require('react');
var ClockMashete = require('./misc/clock');
var ChatMashete = require('./chat/chat');
var PingMashete = require('./pingpong/ping');
var PongMashete = require('./pingpong/pong');
var RedditMashete = require('./reddit/reddit');
var TodoMashete = require('./todo/todo');
var MarkdownMashete = require('./markdown/markdown');
var StocksMashete = require('./stocks/stocks');

var FallbackMashete = require('./misc/fallback');
var ForecastMashete = require('./misc/forecast');
var IframeMashete = require('./misc/iframe');
var LinksMashete = require('./misc/links');
var TitleMashete = require('./misc/title');
var CustomTitleMashete = require('./misc/customtitle');

portal.MashetesStore.ClockMashete = ClockMashete;
portal.MashetesStore.FallbackMashete = FallbackMashete;
portal.MashetesStore.ForecastMashete = ForecastMashete;
portal.MashetesStore.IframeMashete = IframeMashete;
portal.MashetesStore.LinksMashete = LinksMashete;
portal.MashetesStore.MarkdownMashete = MarkdownMashete;
portal.MashetesStore.StocksMashete = StocksMashete;
portal.MashetesStore.TitleMashete = TitleMashete;
portal.MashetesStore.CustomTitleMashete = CustomTitleMashete;
portal.MashetesStore.ChatMashete = ChatMashete;
portal.MashetesStore.TodoMashete = TodoMashete;
portal.MashetesStore.RedditMashete = RedditMashete;
portal.MashetesStore.PingMashete = PingMashete;
portal.MashetesStore.PongMashete = PongMashete;
portal.MashetesStore.React = React;


