/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {

    var StockItem = React.createClass({displayName: 'StockItem',
        getInitialState: function() {
            this.props.bus.on('unselect', function() {
                 this.setState({active: false})
            }.bind(this));
            return { active: false };
        },
        onClick: function() {
            this.props.itemSelected(this.props.item);
            this.setState({active: true});
        },
        render: function() {
            var clzz = this.props.item.progression < 0 ? 'list-group-item list-group-item-danger' : 'list-group-item list-group-item-success';
            clzz = clzz + (this.state.active ? ' active' : '');
            return (
                React.DOM.li({className: clzz, onClick: this.onClick}, 
                    React.DOM.div({className: "row"}, 
                        React.DOM.div({className: "col-md-10"}, 
                            React.DOM.div({className: "row"}, 
                                React.DOM.div({className: "col-md-6"}, React.DOM.b(null, this.props.item.name)), 
                                React.DOM.div({className: "col-md-6"}, this.props.item.value)
                            )
                        ), 
                        React.DOM.div({className: "col-md-2"}, 
                            React.DOM.span({className: "badge"}, this.props.item.progression)
                        )
                    )
                )
            );
        }
    });

    exports.StocksMashete = React.createClass({displayName: 'StocksMashete',
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
            var stocks = [];
            function itemSelected(item) {
                comp.state.bus.trigger('unselect', {});
                comp.setState({ selected: item.name });
            }
            _.map(this.state.stocks, function(item) {
                stocks.push(StockItem({item: item, itemSelected: itemSelected, bus: this.state.bus}));
            }.bind(this));
            return (
                portal.Mashetes.Mashete({title: "Stocks", config: this.props}, 
                    React.DOM.div({className: "pushTop20"}, 
                        React.DOM.ul({className: "list-group"}, 
                        stocks
                        ), 
                        React.DOM.div({className: "centeredText"}, 
                            React.DOM.img({src: this.getImage(this.state.selected)})
                        )
                    )
                )
                );
        }
    });
})(portal.MashetesStore);

