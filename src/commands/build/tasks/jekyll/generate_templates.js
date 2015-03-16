import path from "path";
import doLayout from "./do_layout";
import fsutils from "../../../../utils/fs";

export default function(siteConfig) {

    var jekyllConfig = siteConfig.jekyll;

    var makePath = function(filePath, page) {
        var permalink = siteConfig.permalink;

        var dir = path.dirname(filePath);
        var extension = path.extname(filePath);
        var basename = path.basename(filePath, extension);

        return path.join(dir, `${basename}.html`);
    };

    /*
        Templates are JSX files outside the _layouts directory
    */
    var fn = function() {
        var extensions = [`${path.resolve(siteConfig.destination)}/*.js`];

        var exclusions = ["!app.bundle.js"]
            .concat(
                ["node_modules"]
                    .concat(jekyllConfig.dirs_includes)
                    .concat(jekyllConfig.dirs_layouts)
                    .concat(jekyllConfig.dirs_client_vendor)
                    .concat(jekyllConfig.dir_fora)
                    .concat(siteConfig.dir_client_js)
                    .concat(siteConfig.dir_custom_tasks)
                    .map(dir => `!${dir}/`)
            );

        this.watch(extensions.concat(exclusions), function*(filePath, ev, matches) {
            console.log(filePath);
            var result = yield* doLayout(null, filePath, filePath, makePath, siteConfig);
        }, `build_templates`);
    };

    return { build: true, fn: fn };
}
