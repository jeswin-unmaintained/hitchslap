import path from "path";
import loadDocuments from "./load-documents";
import fsutils from "../../utils/fs";

export default function*(config, buildOptions, siteConfig) {
    /*
        Templates are JSX files outside the _layouts directory
    */
    return function() {
        var extensions = ["*.js"]
            .concat(["_layouts", "_includes", "_site", "vendor"].map(i => { return { exclude: "directory", dir: i }; }));
        this.watch(extensions, function*(filePath, ev, matches) {
            var result = yield* processTemplate("", collection.layout || "default", makePath, siteConfig);
            GLOBAL.site.pages.push(result.page);
        }, `build_templates`);
    };
}
