import React from "react";
import path from "path";
import frontMatter from "front-matter";
import markdown from "node-markdown";
import fsutils from "../../utils/fs";

var md = markdown.Markdown;

var makePage = function(doc) {
    var page = {};
    for (var key in doc.attributes) {
        page[key] = doc.attributes[key];
    }
    page.content = doc.body;
    return page;
};

export default function*(filePath, layout, makePath, siteConfig) {
    var page = filePath ? makePage(frontMatter((yield* fsutils.readFile(filePath)).toString())) : {};
    var layoutFilePath = path.join(siteConfig.source, `${siteConfig.layouts}/${page.layout || layout}`);
    var params = { page: page, content: page.content, site: siteConfig };
    var component = React.createFactory(require(layoutFilePath))(params);
    var html = `<!DOCTYPE html>` + React.renderToString(component);

    var outputPath = path.join(
        siteConfig.destination,
        makePath(filePath, page)
    );
    var outputDir = path.dirname(outputPath);
    if (!yield* fsutils.exists(outputDir)) {
        yield* fsutils.mkdirp(outputDir);
    }
    yield* fsutils.writeFile(outputPath, html);

    return {
        page: makePage(page)
    };
}
