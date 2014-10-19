
/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.StocksMashete = React.createClass({
        getInitialState: function() {
            return {
                displayedStock: this.props.stock || "AAPL"
            };
        },
        getTitle: function() {
            return this.state.displayedStock + " stock progression";
        },
        getUrl: function() {
            return "http://chart.finance.yahoo.com/z?s=" + this.state.displayedStock + "&t=6m&q=l&l=on&z=s&p=m50,m200";
        },
        render: function() {
            return (
                <portal.Mashetes.Mashete title={this.getTitle()} config={this.props}>
                    <div className="centeredText">
                        <img src={this.getUrl()}/>
                    </div>
                </portal.Mashetes.Mashete>
                );
        }
    });
})(portal.MashetesStore);

