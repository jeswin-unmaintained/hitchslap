/*
    You don't need to edit this file.
    Unless you need to.
*/
var joinPath = function(baseurl) {
    return function(url) {
        return (/\/$/).test(baseurl) || (/^\//).test(url) ? baseurl + url : baseurl + "/" + url;
    };
};

export default class Container extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var _joinPath = joinPath(this.props.site.baseurl);
        var css = this.props.css ? this.props.css.map(_joinPath) : [];
        var scripts = this.props.scripts ?
            ["/vendor/react.min.js", "/vendor/jquery.min.js"].concat(this.props.scripts).map(_joinPath) : [];
        return (
            <html>
                <head>
                    <title>{this.props.title}</title>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    {css.map(css => <link type="text/css" rel="stylesheet" href={css}></link>)}
                    {scripts.map(script => <script src={script}></script>)}
                    <script>if(window.__initApp) window.__initApp();</script>
                </head>
                {this.props.children}
            </html>
        );
    }
}
