import path from "path";
var fs = require('fs');

export default function*(siteConfig) {
    /*
        Copy everything that is not a markdown, jsx or yml file.
    */
    return function() {
        var extensions = ["*.*"]
            //add exclusions
            .concat(siteConfig.markdown_ext.map(ext => `!*.${ext}`))
            .concat(["!*.yml"])
            .concat([{ exclude: "directory", dir: "node_modules" }, { exclude: "directory", regex: /^_/ }]);

        this.watch(extensions, function*(filePath, ev, matches) {
            console.log(filePath);
            var destPath = path.join(siteConfig.destination, filePath);
            fs.createReadStream(filePath).pipe(fs.createWriteStream(destPath));
        }, "copy_static_files");
    };
}
