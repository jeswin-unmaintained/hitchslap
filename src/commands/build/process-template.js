import React from "react";
import path from "path";
import fs from "fs";
import frontMatter from "front-matter";
import markdown from "node-markdown";

var md = markdown.Markdown;

var makePage = function(page) {
    return page;
};

export default function*(filePath, layout, makePath, config, siteConfig) {

    //var makePath = function(permalink) {
    //    if (permalink === "date")
    //        permalink = "/:categories/:year/:month/:day/:title.html";
    //    else if (permalink === "pretty")
    //        permalink = "/:categories/:year/:month/:day/:title/index.html";
    //    else if (permalink === "none")
    //        permalink = "/:categories/:title.html";

    //};

    var page = frontMatter(fs.readFileSync(filePath).toString());
    var layoutFilePath = path.join(config.source, `${siteConfig.layouts}/${layout}`);
    var params = { page: page.attributes, content: md(page.body), site: siteConfig };
    var component = React.createFactory(require(layoutFilePath))(params);
    var html = `<!DOCTYPE html>` + React.renderToString(component);
    var outputPath = makePath(filePath, page.attributes.permalink || siteConfig.permalink);

    var outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    fs.writeFileSync(outputPath, html);

    return {
        page: makePage(page)
    };
}
