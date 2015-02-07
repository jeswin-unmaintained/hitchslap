import path from "path";
import frontMatter from "front-matter";
import processTemplate from "./process-template";

export default function*(config, siteConfig, build) {

    GLOBAL.site.pages = [];

    var makePath = function(filePath, permalink) {
        var dir = path.dirname(filePath);
        var extension = path.extname(filePath);
        var basename = path.basename(filePath, extension);

        return permalink === "pretty" ?
            path.join(dir, basename, "index.html") :            
            path.join(dir, `${basename}.html`);
    };

    /*
        Pages are all markdown files residing outside
            a) directories starting with an underscore. eg: _layouts/*, _posts/* aren't pages
            b) directories outside collections
    */

    build.configure(function() {
        var extensions = siteConfig.markdown_ext.map(ext => `*.${ext}`);
        var excludedDirs = [
            /^node_modules\//,
            /^_/
        ];
        this.watch(extensions, function*(filePath, ev, matches) {
            if (!excludedDirs.some(regex => regex.test(filePath))) {
                var result = yield* processTemplate(filePath, "page", makePath, config, siteConfig);
                GLOBAL.site.pages.push(result.page);
            }
        }, "build_pages");
    }, config.source);

    /* Start */
    try {
        build.start(siteConfig.watch);
    } catch(e) {
        console.log(e.stack);
        if (e._inner) console.log(e._inner.stack);
    }



    /*
    var docs = loadDocuments(path.join(config.source, "_pages"), config, buildOptions, siteConfig);

    for(let doc of docs) {
        var { frontMatter, filename } = doc;
        var html = yield* processTemplate(frontMatter, { filename: filename, layout: "page" }, config, buildOptions, siteConfig);
    }

    GLOBAL.site.pages = docs;
    */
}
