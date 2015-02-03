import React from "react";
import Head from "../_includes/head";
import Header from "../_includes/header";
import Footer from "../_includes/footer";

export default class Default extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <html>
                <Head title={this.props.title} />
                <body>

                    <Header />

                    <div class="page-content">
                        <div class="wrapper">
                            {this.props.children}
                        </div>
                    </div>

                    <Footer />

                </body>

            </html>
        );
    }
}
