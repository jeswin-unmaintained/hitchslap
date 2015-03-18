/*
    This is where we package stuff for the client build.
    So, we copy all the transpiled js code into the client (dir_client_build) and client (dir_dev_build) directories.
*/

import path from "path";
import fsutils from "../../../../utils/fs";
import { print, getLogger } from "../../../../utils/logging";

export default function(siteConfig) {
    /*
        Copy everything that is not a markdown, jsx or yml file.
    */

    var logger = getLogger(siteConfig.quiet, "build_client");
    var taskConfig = siteConfig.tasks.build_client;

    var fn = function() {
        var extensions = [
            `${siteConfig.destination}/*.js`,
            `!${siteConfig.destination}/${siteConfig.dir_client_build}/`,
            `!${siteConfig.destination}/${siteConfig.dir_dev_build}/`,
            `!${siteConfig.destination}/${siteConfig.dir_custom_tasks}/`,
        ].concat(
            siteConfig.dirs_client_vendor.map(dir => `!${siteConfig.destination}/${dir}/`)
        );

        var copyFile = function*(filePath, destDir) {
            var relativeFilePath = filePath.substring(siteConfig.destination.length);
                var clientDest = path.join(siteConfig.destination, destDir, relativeFilePath);
            var clientDestDir = path.dirname(clientDest);
            if (!(yield* fsutils.exists(clientDestDir)))
                yield* fsutils.mkdirp(clientDestDir);
            yield* fsutils.copyFile(filePath, clientDest);
        };

        var clientSpecificFiles = [];
        var devSpecificFiles = [];

        this.watch(extensions, function*(filePath, ev, matches) {
            if (new RegExp(`${siteConfig.client_js_suffix}\.js$`).text(filePath))
                clientSpecificFiles.push(filePath);
            yield* copyFile(filePath, siteConfig.dir_client_build);

            if (taskConfig.dev) {
                if (new RegExp(`~${siteConfig.dev_js_suffix}\.js$`).text(filePath))
                    devSpecificFiles.push(filePath);
                yield* copyFile(filePath, siteConfig.dir_dev_build);
            }
        }, "build_client");

        var replaceFiles = function*(files, suffix) {
            var regex = new RegExp(`~${suffix}\\.js$`);
            console.log(regex);
            for (let file of files) {
                let original = file.replace(regex, ".js");
                let renamed = original.replace(/\.js$/, "_base.js");
                let originalContents = yield* fsutils.readFile(original);
                yield* fsutils.writeFile(renamed, originalContents);
                let renamedContents = yield* fsutils.readFile(original);
                yield* fsutils.writeFile(original, renamedContents);
            }
        };

        this.onComplete(function*() {
            replaceFiles(clientSpecificFiles, client_js_suffix);
            if (taskConfig.dev)
                replaceFiles(devSpecificFiles, dev_js_suffix);
        });
    };

    return { build: true, fn: fn };
}
