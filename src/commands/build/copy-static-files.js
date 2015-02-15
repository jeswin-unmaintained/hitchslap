import path from "path";
import fs from "fs";
import fsutils from "../../utils/fs";

export default function*(siteConfig) {
    /*
        Copy everything that is not a markdown, jsx or yml file.
    */
    return function() {
        var extensions = ["*.*"]
            //add exclusions
            .concat(siteConfig.markdown_ext.map(ext => `!*.${ext}`))
            .concat(["!*.yml", "!*.yaml"])
            .concat([{ exclude: "directory", dir: "node_modules" }, { exclude: "directory", regex: /^_/ }]);

        this.watch(extensions, function*(filePath, ev, matches) {
            var destPath = path.join(siteConfig.destination, filePath);
            var outputDir = path.dirname(destPath);
            if (!(yield* fsutils.exists(outputDir))) {
                yield* fsutils.mkdirp(outputDir);
            }
            fs.createReadStream(filePath).pipe(fs.createWriteStream(destPath));
        }, "copy_static_files");
    };
}
