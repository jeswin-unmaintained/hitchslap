import path from "path";
import fs from "fs";
import fsutils from "../../../utils/fs";
import { print, getLogger } from "../../../utils/logging";

/*
    Copy everything that is not a markdown or yml file.
*/
let copyStaticFiles = function(siteConfig, buildConfig, taskConfig) {
    let logger = getLogger(siteConfig.quiet, "copy-static-files");

    let fn = function() {
        let extensions = ["*.*"];
        let excluded = siteConfig.dirs_exclude
            .concat(siteConfig.destination)
            .map(dir => `!${dir}/`)
            .concat(taskConfig.skip_extensions.map(ext => `!*.${ext}`))
            .concat(siteConfig.patterns_exclude);

        let copiedFiles = [];

        this.watch(extensions.concat(excluded), function*(filePath, ev, matches) {
            copiedFiles.push(filePath);
            let newFilePath = fsutils.changeExtension(filePath, [{ to: "js", from: siteConfig.js_extensions }]);
            yield* fsutils.copyFile(filePath, path.join(siteConfig.destination, newFilePath), { overwrite: false });
        }, "copy-static-files");

        this.onComplete(function*() {
            logger(`copied ${copiedFiles.length} files`);
        });
    };

    return { build: true, fn: fn };
};

export default copyStaticFiles;
