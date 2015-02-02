import React from "react";
import path from "path";

export default function*(doc, options, config, buildOptions, siteConfig) {
    var layout = doc.layout || options.layout || "default";

    var fullPath = path.join(config.source, `_layout/${layout}.jsx`);
    var jsx = require(fullPath);
    var html = React.renderComponentToString(jsx);
    console.log(html);
}
