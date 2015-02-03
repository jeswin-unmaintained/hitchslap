import React from "react";
import Default from "./default";

export default class Page extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <Default title={this.props.page.title}>
                <div class="post">

                    <header class="post-header">
                        <h1 class="post-title">{ this.props.page.title }</h1>
                    </header>

                    <article class="post-content">
                        { this.props.content }
                    </article>

                </div>
            </Default>
        );
    }
}
