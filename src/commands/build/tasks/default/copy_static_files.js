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
        var extensions = ["*.*"];
        var excluded = siteConfig.dirs_exclude
            .concat(siteConfig.destination)
            .map(dir => `!${dir}/`)
            .concat(taskConfig.skip_extensions.map(ext => `!*.${ext}`));

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

        this.watch(extensions.concat(excluded), function*(filePath, ev, matches) {
            copiedFiles.push(filePath);
            var newFilePath = fsutils.changeExtension(
                filePath,
                [ { to: "js", from: siteConfig.js_extensions }]
            );
            yield* copyFile(newFilePath, siteConfig.destination);
            yield* copyFile(newFilePath, path.join(siteConfig.destination, siteConfig.dir_client_build));
            if (siteConfig.build_dev)
                yield* copyFile(newFilePath, path.join(siteConfig.destination, siteConfig.dir_dev_build));
        }, "copy_static_files");

        this.onComplete(function*() {
            logger(`copied ${copiedFiles.length} files`);
            copiedFiles = [];
        });
    };

    return { build: true, fn: fn };
}
