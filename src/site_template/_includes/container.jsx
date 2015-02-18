import HtmlPage from "../_hitchslap/htmlpage"
import Header from "./header";
import Footer from "./footer";

export default class Container extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <HtmlPage title={this.props.title} scripts={["abcd.js"]} css={["hello.js"]}>
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
