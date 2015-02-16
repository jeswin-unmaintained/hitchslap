import Default from "./default";

export default class Page extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <Default title={this.props.page.title}>
                <div className="post">

                    <header className="post-header">
                        <h1 className="post-title">{ this.props.page.title }</h1>
                    </header>

                    <article className="post-content">
                        <div dangerouslySetInnerHTML={{__html: this.props.content}}></div>
                    </article>

                </div>
            </Default>
        );
    }
}
