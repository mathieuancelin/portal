/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {

    var StockItem = React.createClass({
        getInitialState: function() {
            return { active: false };
        },
        onClick: function() {
            this.props.itemSelected(this.props.item);
        },
        render: function() {
            var clzz = this.props.item.progression < 0 ? 'list-group-item list-group-item-danger' : 'list-group-item list-group-item-success';
            clzz = clzz + (this.state.active ? ' active' : '');
            return (
                <li className={clzz} onClick={this.onClick}>
                    <div className="row">
                        <div className="col-md-10">
                            <div className="row">
                                <div className="col-md-6"><b>{this.props.item.name}</b></div>
                                <div className="col-md-6">{this.props.item.value}</div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <span className="badge">{this.props.item.progression}</span>
                        </div>
                    </div>
                </li>
            );
        }
    });

    exports.StocksMashete = React.createClass({
        getInitialState: function() {
            var stocks = this.props.stocks || ["NASDAQ:MSFT", "NASDAQ:YHOO", "NASDAQ:AAPL", "NASDAQ:EBAY", "NASDAQ:GOOG", "NASDAQ:AMZN"];
            var target = this;
            function refresh() {
                portal.Http.url('http://finance.google.com/finance/info?client=ig&q=' + stocks.join(',')).get().then(function (data) {
                    this.setState({
                        stocks: _.map(data.response.json, function (item) {
                            console.log(item);
                            return {
                                name: item.t,
                                value: item.l_cur,
                                progression: item.c
                            };
                        })
                    });
                    setTimeout(refresh, 60000);
                }.bind(target));
            }
            refresh();
            return {
                stocks: [],
                selected: stocks[0].split(':')[1]
            };
        },
        getTitle: function() {
            return this.state.displayedStock + " stock progression";
        },
        getImage: function(stock) {
            return "http://chart.finance.yahoo.com/z?s=" + stock + "&t=6m&q=l&l=on&z=s&p=m50,m200";
        },
        render: function() {
            var comp = this;
            function itemSelected(item) {
                comp.setState({ selected: item.name });
            }
            var stocksLi = _.map(this.state.stocks, function(item) {
                return (<StockItem item={item} itemSelected={itemSelected} />);
            }.bind(this));
            return (
                <portal.Mashetes.Mashete title="Stocks" config={this.props}>
                    <div className="pushTop20">
                        <ul className="list-group">
                        {stocksLi}
                        </ul>
                        <div className="centeredText">
                            <img src={this.getImage(this.state.selected)}/>
                        </div>
                    </div>
                </portal.Mashetes.Mashete>
                );
        }
    });
})(portal.MashetesStore);

