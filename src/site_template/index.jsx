import React from "react";

export default class Index extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="home">
                <div className="container-fluid">
                    <div className="row fitted">
                        <div className="col-md-2 index-pane">
                        </div>
                        <div className="col-md-4 left-pane">
                            <section className="content-area list">
                                <h2><a href="/articles">Articles</a></h2>
                                <ul className="tight">
                                {
                                    site.posts.map(post =>
                                        <li>
                                        {[
                                            post.externalUrl ?
                                                <h4>
                                                    <a href="{post.externalUrl}">{post.title}</a>
                                                </h4> :
                                                <h4>
                                                    <a className="post-link" href="{ post.url | prepend: site.baseurl }">{post.title}</a>
                                                </h4>,
                                            post.summary &&
                                                <p>{post.summary}</p>
                                        ]}
                                        </li>
                                    )
                                }
                                </ul>
                                <p className="more-link"><a href="/articles">More articles...</a></p>
                            </section>
                        </div>
                        <div className="col-md-4 right-pane">
                            <section className="content-area list">
                                <h2><a href="/projects">Projects</a></h2>
                                <ul className="tight">
                                {
                                    site.data.projects.map(proj =>
                                        <li>
                                            <h4>
                                                <a href="{proj.url}">{proj.name}</a>
                                            </h4>
                                            <p>
                                                {proj.summary}
                                            </p>
                                        </li>
                                    )
                                }
                                </ul>
                                <p className="more-link"><a href="/projects">More projects...</a></p>
                            </section>
                        </div>
                        <div className="col-md-2 alt-pane">
                            <section className="content-area list">
                                <ul className="gallery">
                                {
                                    site.data.projects.map(img =>
                                        <li>
                                            <img src="{{img.src}}" alt="{{img.name}}" />
                                            <br />
                                            <p className="caption">{img.name}</p>
                                        </li>
                                    )
                                }
                                </ul>
                                <p className="more-link"><a href="/art">More art...</a></p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
