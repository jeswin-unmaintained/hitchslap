import path from "path";
import fs from "fs";
import fsutils from "../../../../utils/fs";
import { print, getLogger } from "../../../../utils/logging";

export default function(siteConfig) {
    /*
        Copy everything that is not a markdown, jsx or yml file.
    */

    var logger = getLogger(siteConfig, "copy-static-files");
    var taskConfig = siteConfig.tasks["copy-static-files"];

    var fn = function() {
        var extensions = ["*.*"]
            //add exclusions
            .concat(taskConfig.skip_extensions
                .map(ext => `!*.${ext}`))
            .concat([siteConfig.destination, "node_modules"]
                .map(dir => `!${dir}/`));

        var copiedFiles = [];
        this.watch(extensions, function*(filePath, ev, matches) {
            copiedFiles.push(filePath);
            var destPath = path.join(siteConfig.destination, filePath);
            var outputDir = path.dirname(destPath);

            if (!(yield* fsutils.exists(outputDir))) {
                yield* fsutils.mkdirp(outputDir);
            }

            if (!(yield* fsutils.exists(destPath))) {
                fs.createReadStream(filePath).pipe(fs.createWriteStream(destPath));
            }
        }, "copy_static_files");

        this.onComplete(function*() {
            logger(`copied ${copiedFiles.length} files`);
        });
    };

    return { build: true, fn: fn };
}
