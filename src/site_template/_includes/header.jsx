import React from "react";

export default class Page extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div class="navbar">
                <div class="navbar-header">
                    <button class="navbar-toggle collapsed" type="button" data-toggle="collapse">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                </div>
                <nav class="collapse navbar-collapse">
                    <ul class="nav navbar-nav">
                        <li style={{background:"darkgreen"}}>
                            <a href="/">Home</a>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    }
}
