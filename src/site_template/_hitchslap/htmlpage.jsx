/*
    You don't need to edit this file.
    Unless you need to.
*/
var joinPath = function(baseurl) {
    return function(url) {
        return (/\/$/).test(baseurl) ? baseurl + url : baseurl + "/" + url;
    };
};

export default class Container extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var css = this.props.css ? this.props.css.map(joinPath(this.props.site.baseurl)) : [];
        var scripts = this.props.scripts ? this.props.scripts.map(joinPath(this.props.site.baseurl)) : [];
        return (
            <html>
                <head>
                    <title>{this.props.title}</title>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    {css.map(css => <link type="text/css" href={css}></link>)}
                    {scripts.map(script => <script href={script}></script>)}
                </head>
                {this.props.children}
            </html>
        );
    }
}
