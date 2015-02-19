import path from "path";
import frontMatter from "front-matter";
import doLayout from "./do-layout";
import fsutils from "../../utils/fs";

export default function(siteConfig) {

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
            .concat(
                ["dir_data", "dir_hitchslap", "dir_includes", "dir_layouts",
                        "dir_plugins", "dir_posts",  "dir_css",  "dir_client_js"]
                    .map(k => siteConfig[k])
                    .concat("node_modules")
                    .concat(Object.keys(siteConfig.collections))
                    .map(dir => { return { exclude: "directory", dir }; })
            );
        this.watch(extensions, function*(filePath, ev, matches) {
            var result = yield* doLayout(filePath, "page", makePath, siteConfig);
            GLOBAL.site.pages.push(result.page);
        }, "build_pages");
    };
}
