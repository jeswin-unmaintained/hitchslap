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
            `${siteConfig.destination}/*.js`, `${siteConfig.destination}/*.json`,
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
            if (new RegExp(`${siteConfig.client_js_suffix}\.(js|json)$`).test(filePath)) {
                var clientFilePath = path.join(siteConfig.dir_client_build, path.basename(filePath));
                clientSpecificFiles.push(clientFilePath);
            }
            yield* copyFile(filePath, siteConfig.dir_client_build);

            if (taskConfig.dev) {
                if (new RegExp(`~${siteConfig.dev_js_suffix}\.(js|json)$`).test(filePath)) {
                    var devFilePath = path.join(siteConfig.dir_client_build, path.basename(filePath));
                    devSpecificFiles.push(devFilePath);
                }
                yield* copyFile(filePath, siteConfig.dir_dev_build);
            }
        }, "build_client");

        var replaceFiles = function*(files, suffix) {
            for (let file of files) {
                var extension = /\.js$/.test(file) ? "js" : "json";
                var regex = new RegExp(`${suffix}\\.${extension}$`);
                let original = file.replace(regex, `.${extension}`);
                let renamed = original.replace(/\.js$/, `_base.${extension}`);
                console.log(file, original, renamed);
                let originalContents = yield* fsutils.readFile(original);
                yield* fsutils.writeFile(renamed, originalContents);
                let renamedContents = yield* fsutils.readFile(original);
                yield* fsutils.writeFile(original, renamedContents);
                yield* fsutils.remove(file);
            }
        };

        this.onComplete(function*() {
            yield* replaceFiles(clientSpecificFiles, siteConfig.client_js_suffix);
            if (taskConfig.dev)
                yield* replaceFiles(devSpecificFiles, siteConfig.dev_js_suffix);
        });
    };

    return { build: true, fn: fn };
}
