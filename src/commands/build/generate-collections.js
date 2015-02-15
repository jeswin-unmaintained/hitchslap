import path from "path";
import frontMatter from "front-matter";
import processTemplate from "./process-template";
import fsutils from "../../utils/fs";

export default function*(siteConfig) {

    GLOBAL.site.collections = [];

    var getMakePath = function(collection) {
        return function(filePath, page) {
            var permalink = page.permalink || collection.permalink || siteConfig.permalink;
            var dir = path.dirname(filePath);
            var extension = path.extname(filePath);
            var basename = path.basename(filePath, extension);

            if (/\/$/.test(permalink))
                permalink += "index.html";

            return permalink === "pretty" ?
                path.join(dir, basename, "index.html") :
                path.join(dir, `${basename}.html`);
        };
    };

    /*
        Pages are all markdown files residing outside
            a) directories starting with an underscore. eg: _layouts/*, _posts/* aren't pages
            b) directories outside collections
    */
    return function() {
        if (siteConfig.collection) {
            Object.keys(siteConfig.collection).forEach(collectionName => {
                let collection = siteConfig.collections[collectionName];
                let makePath = getMakePath(collection);
                if (collection.output) {
                    let extensions = siteConfig.markdown_ext.map(ext => `${collectionName}/*.${ext}`);
                    this.watch(extensions, function*(filePath, ev, matches) {
                        var result = yield* processTemplate(filePath, collection.layout || "default", makePath, siteConfig);
                        GLOBAL.site.pages.push(result.page);
                    }, `build_collection_${collectionName}`);
                }
            });
        }
    };
}
