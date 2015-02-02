import path from "path";
import loadDocuments from "./load-documents";
import processTemplate from "./process-template";

export default function*(config, buildOptions, siteConfig) {
    var docs = loadDocuments(path.join(config.source, "_pages"));

    for(let doc of docs) {
        yield* processTemplate(doc, { layout: "pages" }, config, buildOptions, siteConfig);
    }

    GLOBAL.site.pages = docs;
}
