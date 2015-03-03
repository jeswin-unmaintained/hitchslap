import path from "path";
import fs from "fs";
import fsutils from "../../../utils/fs";
import configutils from  "../../../utils/config";

export default function(siteConfig) {
    /*
        Copy everything that is not a markdown, jsx or yml file.
    */
    return function() {
        var extensions = ["*.*"]
            //add exclusions
            .concat(siteConfig.skip_copying_extensions
                .map(ext => `!*.${ext}`))
            .concat([siteConfig.destination, "node_modules"]
                .map(dir => `!${dir}/`));

        //If we are in jekyll blog mode, do not copy markdown files.
        if (siteConfig.mode === "jekyll")
            extensions = extensions.concat(siteConfig.markdown_ext.map(ext => `!*.${ext}`));

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
