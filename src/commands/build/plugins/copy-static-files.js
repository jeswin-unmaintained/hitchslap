import path from "path";
import fs from "fs";
import fsutils from "../../../utils/fs";
import { print, getLogger } from "../../../utils/logging";
import optimist from "optimist";

let argv = optimist.argv;

/*
    options: {
        destination: string,
        extensions: [string],
        excludedDirectories: [string],
        excludedPatterns: [regex or string],
        excludedExtensions: [string],
        excludedWatchPatterns = [regex],
        changeExtensions: [ { to: "js", from: ["es6", "jsx"]}]
        quiet: bool
    }
*/
let copyStaticFiles = function(name, options) {
    let logger = getLogger(options.quiet, name || "copy-static-files");

    //defaults
    options.extensions = options.extensions || ["*.*"];
    options.excludedDirectories = options.excludedDirectories || [options.destination];
    options.excludedPatterns = (options.excludedPatterns || [])
        .map(p => typeof p === "string" ? new RegExp(p) : p);
    options.excludedExtensions = options.excludedExtensions || [];
    options.excludedWatchPatterns = options.excludedWatchPatterns || [];

    let fn = function() {
        let excluded = options.excludedDirectories
            .map(dir => `!${dir}/`)
            .concat(options.excludedExtensions.map(ext => `!*.${ext}`))
            .concat(options.excludedPatterns);

        let copiedFiles = [];

        this.watch(options.extensions.concat(excluded), function*(filePath, ev, matches) {
            if (!options.excludedWatchPatterns.some(regex => regex.test(filePath))) {
                copiedFiles.push(filePath);
                let newFilePath = fsutils.changeExtension(filePath, options.changeExtensions);
                let outputPath = path.join(options.destination, newFilePath);
                yield* fsutils.copyFile(filePath, outputPath, { overwrite: false });

                if (argv[`verbose-${name}`]) {
                    logger(`${filePath} -> ${outputPath}`);
                }
            }
        }, "copy-static-files");

        this.onComplete(function*() {
            logger(`copied ${copiedFiles.length} files`);
        });
    };

    return { build: true, fn: fn };
};

export default copyStaticFiles;
