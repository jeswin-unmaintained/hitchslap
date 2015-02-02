import React from "react";
import Nav from "./_includes/nav.js";

export class Index extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div class="home">
                <div class="container-fluid">
                    <div class="row fitted">
                        <div class="col-md-2 index-pane">
                            <Nav />
                        </div>
                        <div class="col-md-4 left-pane">
                            <section class="content-area list">
                                <h2><a href="/articles">Articles</a></h2>
                                <ul class="tight">
                                {
                                    site.posts.map(post =>
                                        <li>
                                        {[
                                            post.externalUrl ?
                                                <h4>
                                                    <a href="{post.externalUrl}">{post.title}</a>
                                                </h4> :
                                                <h4>
                                                    <a class="post-link" href="{ post.url | prepend: site.baseurl }">{post.title}</a>
                                                </h4>,
                                            post.summary &&
                                                <p>{post.summary}</p>
                                        ]}
                                        </li>
                                    )
                                }
                                </ul>
                                <p class="more-link"><a href="/articles">More articles...</a></p>
                            </section>
                        </div>
                        <div class="col-md-4 right-pane">
                            <section class="content-area list">
                                <h2><a href="/projects">Projects</a></h2>
                                <ul class="tight">
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
                                <p class="more-link"><a href="/projects">More projects...</a></p>
                            </section>
                        </div>
                        <div class="col-md-2 alt-pane">
                            <section class="content-area list">
                                <ul class="gallery">
                                {
                                    site.data.projects.map(img =>
                                        <li>
                                            <img src="{{img.src}}" alt="{{img.name}}" />
                                            <br />
                                            <p class="caption">{img.name}</p>
                                        </li>
                                    )
                                }
                                </ul>
                                <p class="more-link"><a href="/art">More art...</a></p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
