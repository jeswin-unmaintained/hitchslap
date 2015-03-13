import React from "react";

export default class Page extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="navbar">
                <div className="navbar-header">
                    <button className="navbar-toggle collapsed" type="button" data-toggle="collapse">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                </div>
                <nav className="collapse navbar-collapse">
                    <ul className="nav navbar-nav">
                        <li style={{background:"darkgreen"}}>
                            <a href="/">Home</a>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    }
}
