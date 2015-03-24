import path from "path";
import fs from "fs";
import fsutils from "../../../../utils/fs";
import { print, getLogger } from "../../../../utils/logging";

export default function(siteConfig) {
    /*
        Copy everything that is not a markdown or yml file.
    */

    var logger = getLogger(siteConfig.quiet, "copy_static_files");
    var taskConfig = siteConfig.tasks.copy_static_files;

    var fn = function() {
        var extensions = ["*.*"]
            //add exclusions
            .concat(taskConfig.skip_extensions
                .map(ext => `!*.${ext}`))
            .concat([siteConfig.destination, "node_modules"]
                .map(dir => `!${dir}/`));
        var copiedFiles = [];

        var copyFile = function*(filePath, dir) {
            var destPath = path.join(dir, filePath);
            var outputDir = path.dirname(destPath);

            if (!(yield* fsutils.exists(outputDir))) {
                yield* fsutils.mkdirp(outputDir);
            }

            if (!(yield* fsutils.exists(destPath))) {
                fs.createReadStream(filePath).pipe(fs.createWriteStream(destPath));
            }
        };

        this.watch(extensions, function*(filePath, ev, matches) {
            copiedFiles.push(filePath);
            yield* copyFile(filePath, siteConfig.destination);
            yield* copyFile(filePath, path.join(siteConfig.destination, siteConfig.dir_client_build));
            if (siteConfig.build_dev)
                yield* copyFile(filePath, path.join(siteConfig.destination, siteConfig.dir_dev_build));
        }, "copy_static_files");

        this.onComplete(function*() {
            logger(`copied ${copiedFiles.length} files`);
            copiedFiles = [];
        });
    };

    return { build: true, fn: fn };
}
