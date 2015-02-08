import React from "react";
import path from "path";
import fs from "fs";
import frontMatter from "front-matter";
import markdown from "node-markdown";
import mkdirp from "mkdirp";

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

    var page = makePage(frontMatter(fs.readFileSync(filePath).toString()));
    var layoutFilePath = path.join(siteConfig.source, `${siteConfig.layouts}/${layout}`);
    var params = { page: page, content: page.content, site: siteConfig };
    var component = React.createFactory(require(layoutFilePath))(params);
    var html = `<!DOCTYPE html>` + React.renderToString(component);

    var outputPath = path.join(
        siteConfig.destination,
        makePath(filePath, page, page.permalink || siteConfig.permalink)
    );
    var outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        mkdirp.sync(outputDir);
    }
    fs.writeFileSync(outputPath, html);

    return {
        page: makePage(page)
    };
}
