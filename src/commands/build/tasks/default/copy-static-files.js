import path from "path";
import fs from "fs";
import fsutils from "../../../../utils/fs";
import { print, getLogger } from "../../../../utils/logging";

var copyStaticFiles = function(siteConfig) {
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
            .concat(taskConfig.skip_extensions.map(ext => `!*.${ext}`))
            .concat(siteConfig.patterns_exclude);

        var copiedFiles = [];

        this.watch(extensions.concat(excluded), function*(filePath, ev, matches) {
            copiedFiles.push(filePath);
            var newFilePath = fsutils.changeExtension(filePath, [{ to: "js", from: siteConfig.js_extensions }]);
            yield* fsutils.copyFile(filePath, path.join(siteConfig.destination, newFilePath), { overwrite: false });
        }, "copy_static_files");

        this.onComplete(function*() {
            logger(`copied ${copiedFiles.length} files`);
        });
    };

    return { build: true, fn: fn };
};

export default copyStaticFiles;
