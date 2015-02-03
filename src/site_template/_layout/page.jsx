import React from "react";

export default class Page extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div class="post">

                <header class="post-header">
                    <h1 class="post-title">{ this.props.page.title }</h1>
                </header>

                <article class="post-content">
                    { this.props.content }
                </article>

            </div>
        );
    }
}
