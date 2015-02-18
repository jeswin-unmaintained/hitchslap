export default class Container extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <html>
                <head>
                    <title>{this.props.title}</title>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    {this.props.css ? this.props.css.map(css => <link type="text/css" href={css}></link>) : []}
                    {this.props.scripts ? this.props.scripts.map(script => <script href={script}></script>) : []}
                </head>
                {this.props.children}
            </html>
        );
    }
}
