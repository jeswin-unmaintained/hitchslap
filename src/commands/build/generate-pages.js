import path from "path";
import frontMatter from "front-matter";
import processTemplate from "./process-template";
import fsutils from "../../utils/fs";

export default function*(siteConfig) {

    GLOBAL.site.pages = [];

    var makePath = function(filePath, page) {
        var permalink = page.permalink || siteConfig.permalink;

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
    return function() {
        var extensions = siteConfig.markdown_ext.map(ext => `*.${ext}`)
            .concat([{ exclude: "directory", dir: "node_modules" }, { exclude: "directory", regex: /^_/ }])
            .concat(Object.keys(siteConfig.collections).map(name => { return { exclude: "directory", dir: name }; }));
        this.watch(extensions, function*(filePath, ev, matches) {
            var result = yield* processTemplate(filePath, "page", makePath, siteConfig);
            GLOBAL.site.pages.push(result.page);
        }, "build_pages");
    };
}
