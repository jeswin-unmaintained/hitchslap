import React from "react";
import path from "path";
import frontMatter from "front-matter";
import markdown from "node-markdown";
import fsutils from "../../../utils/fs";
import pretty from "pretty";

var md = markdown.Markdown;

var makePage = function(doc) {
    var page = {};
    for (var key in doc.attributes) {
        page[key] = doc.attributes[key];
    }
    page.content = doc.body;
    return page;
};

export default function*(sourcePath, layout, makePath, siteConfig) {
    try {
        var page, layoutsourcePath, params, component;

        //Source path and layout are the same only when generating plain JSX templates (without frontmatter)
        if (sourcePath !== layout) {
            page = makePage(frontMatter(yield* fsutils.readFile(sourcePath)));
            layoutsourcePath = path.resolve(siteConfig.destination, `${siteConfig.dir_layouts}/${page.layout || layout}`);
            params = { page: page, content: page.content, site: siteConfig };
        } else {
            page = {};
            layoutsourcePath = path.resolve(siteConfig.destination, layout);
            params = { page: page, content: "", site: siteConfig };
        }
        component = React.createFactory(require(layoutsourcePath))(params);
        var reactHtml = React.renderToString(component);
        var html = `<!DOCTYPE html>` + siteConfig.beautify ? pretty(reactHtml) : reactHtml;

        var outputPath = path.resolve(
            siteConfig.destination,
            makePath(sourcePath, page)
        );

        var outputDir = path.dirname(outputPath);
        if (!yield* fsutils.exists(outputDir)) {
            yield* fsutils.mkdirp(outputDir);
        }

        if (!siteConfig.quiet)
            console.log(`Generating ${sourcePath} -> ${outputPath}`);

        yield* fsutils.writeFile(outputPath, html);

        return { page };
    } catch(err) {
        console.log(`Cannot process ${sourcePath} with template ${layout}.`);
        throw err;
    }
}
