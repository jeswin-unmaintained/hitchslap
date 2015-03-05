import React from "react";
import HtmlPage from "../_fora/htmlpage";
import Header from "./header";
import Footer from "./footer";

var cssFiles = [
    "/vendor/bootstrap/css/bootstrap.min.css",
    "/css/main.css"
];

var jsFiles = [
    "/vendor/bootstrap/js/bootstrap.min.js",
    "/app.bundle.js"
];

export default class Container extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <HtmlPage {...this.props} css={cssFiles} scripts={jsFiles}>
                <body>
                    <Header />

                    <div className="page-content">
                        <div className="wrapper">
                            {this.props.children}
                        </div>
                    </div>

                    <Footer />

                </body>
            </HtmlPage>
        );
    }
}
