var React = require('react');
var StockItem = require('./stockitem');

module.exports = React.createClass({
    getInitialState: function() {
        var stocks = this.props.stocks || ["NASDAQ:MSFT", "NASDAQ:YHOO", "NASDAQ:AAPL", "NASDAQ:EBAY", "NASDAQ:GOOG", "NASDAQ:AMZN"];
        var target = this;
        function refresh() {
            portal.Http.url('http://finance.google.com/finance/info?client=ig&q=' + stocks.join(',')).get().then(function (data) {
                this.setState({
                    stocks: _.map(data.response.json, function (item) {
                        return {
                            _id: portal.Utils.generateUUID(),
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
            selected: stocks[0].split(':')[1],
            bus: _.extend({}, Backbone.Events)
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
            comp.state.bus.trigger('unselect', {});
            comp.setState({ selected: item.name });
        }
        var stocks = _.map(this.state.stocks, function(item) {
            return (<StockItem key={item._id} item={item} itemSelected={itemSelected} bus={this.state.bus}/>);
        }.bind(this));
        return (
            <portal.Mashetes.Mashete title="Stocks" config={this.props}>
                <div className="pushTop20">
                    <ul className="list-group">
                    {stocks}
                    </ul>
                    <div className="centeredText">
                        <img src={this.getImage(this.state.selected)}/>
                    </div>
                </div>
            </portal.Mashetes.Mashete>
            );
    }
});

