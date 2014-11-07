var React = require('react');

module.exports = React.createClass({
    render: function() {
        var storyNodes = this.props.items.map(function(item) {
            return (
                <tr key={item.data.url}>
                    <td>
                        <p className="score">{item.data.score}</p>
                    </td>
                    <td>
                        <p className="title">
                            <a href={item.data.url} target="_blank">
                            {item.data.title}
                            </a>
                        </p>
                        <p className="author">
                        Posted by <b>{item.data.author}</b>
                        </p>
                    </td>
                </tr>
            );
        });

        return (
            <table>
                <tbody>
                {storyNodes}
                </tbody>
            </table>
        );
    }
});