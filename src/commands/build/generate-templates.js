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
        var extensions = [`${siteConfig.destination}/*.js`]
            //exclude these directories.
            .concat(
                ["_layouts", "_includes", "_site", "_vendor", "node_modules"]
                    .map(dir => { return { exclude: "directory", dir }; })
            );
        this.watch(extensions, function*(filePath, ev, matches) {
            var result = yield* doLayout(filePath, filePath, makePath, siteConfig);
        }, `build_templates`);
    };
}
