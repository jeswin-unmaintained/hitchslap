import React from "react";
import path from "path";

export default function*(doc, options, config, buildOptions, siteConfig) {
    var layout = doc.layout || options.layout || "default";
    var fullPath = path.join(config.source, `_layout/${layout}.jsx`);
    var params = { page: doc.attributes, content: doc.body };
    var component = React.createFactory(require(fullPath))(params);
    var html = React.renderToString(component);
    console.log(html);
}
