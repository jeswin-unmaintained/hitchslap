import path from "path";
import fsutils from "../../utils/fs";
import doLayout from "./do-layout";

export default function(siteConfig) {

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
    return function() {
        var extensions = [`${path.resolve(siteConfig.destination)}/*.js`, "!app.bundle.js"]
            //exclude these directories.
            .concat(
                ["dir_hitchslap", "dir_includes", "dir_layouts",
                        "dir_plugins", "dir_posts",  "dir_css",  "dir_client_js"]
                    .map(k => siteConfig[k])
                    .concat("node_modules")
                    .map(dir => { return { exclude: "directory", dir }; })
            );
        this.watch(extensions, function*(filePath, ev, matches) {
            var result = yield* doLayout(filePath, filePath, makePath, siteConfig);
        }, `build_templates`);
    };
}
