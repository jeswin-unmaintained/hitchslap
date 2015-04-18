import path from "path";
import fs from "fs";
import fsutils from "../../../utils/fs";
import { print, getLogger } from "../../../utils/logging";

/*
    options: {
        destination: string,
        extensions: [string],
        excludedDirectories: [string],
        excludedPatterns: [regex or string],
        excludedExtensions: [string],
        changeExtensions: [ { to: "js", from: ["es6", "jsx"]}]
        quiet: bool
    }
*/
let copyStaticFiles = function(name, options) {
    let logger = getLogger(options.quiet, name || "babel");

    //defaults
    options.extensions = options.extensions || ["*.*"];
    options.excludedDirectories = options.excludedDirectories || [options.destination];
    options.excludedPatterns = (options.excludedPatterns || [])
        .map(p => typeof p === "string" ? new RegExp(p) : p);
    options.excludedExtensions = options.excludedExtensions || [];

    let fn = function() {
        let excluded = options.excludedDirectories
            .map(dir => `!${dir}/`)
            .concat(options.excludedExtensions.map(ext => `!*.${ext}`))
            .concat(options.excludedPatterns);

        let copiedFiles = [];

        this.watch(options.extensions.concat(excluded), function*(filePath, ev, matches) {
            copiedFiles.push(filePath);
            let newFilePath = fsutils.changeExtension(filePath, options.changeExtensions);
            yield* fsutils.copyFile(filePath, path.join(options.destination, newFilePath), { overwrite: false });
        }, "copy-static-files");

        this.onComplete(function*() {
            logger(`copied ${copiedFiles.length} files`);
        });
    };

    return { build: true, fn: fn };
};

export default copyStaticFiles;
