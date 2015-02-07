import React from "react";

export default class Page extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{this.props.title}</title>
            </head>
        );
    }
}
